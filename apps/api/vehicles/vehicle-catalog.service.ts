import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

type NhtsaResponse<T> = {
  Count: number;
  Message: string;
  Results: T[];
};

type NhtsaMake = { Make_ID: number; Make_Name: string };
type NhtsaModel = { Make_ID: number; Make_Name: string; Model_ID: number; Model_Name: string };

export type VehicleCatalogMake = { id: number; name: string };
export type VehicleCatalogModel = { id: number; name: string; makeId: number; makeName: string };

type CacheEntry<T> = { data: T; expiresAt: number };

@Injectable()
export class VehicleCatalogService {
  private readonly logger = new Logger(VehicleCatalogService.name);
  private readonly cacheTtlMs = 1000 * 60 * 60 * 24; // 24 hours
  private readonly makesUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json';
  private readonly modelsUrl = (makeId: number) =>
    `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/${makeId}?format=json`;

  private makesCache?: CacheEntry<VehicleCatalogMake[]>;
  private modelsCache = new Map<number, CacheEntry<VehicleCatalogModel[]>>();

  private isCacheValid<T>(entry?: CacheEntry<T>): entry is CacheEntry<T> {
    return !!entry && entry.expiresAt > Date.now();
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'appointments-app/vehicle-catalog (https://cursor.sh)' },
    });
    if (!res.ok) {
      throw new Error(`Upstream catalog request failed (${res.status} ${res.statusText})`);
    }
    return res.json() as Promise<T>;
  }

  private logAndThrow(message: string, err: unknown): never {
    const details = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    this.logger.error(`${message} - ${details}`);
    throw new InternalServerErrorException(message);
  }

  async getMakes(search?: string): Promise<VehicleCatalogMake[]> {
    if (!this.isCacheValid(this.makesCache)) {
      try {
        const payload = await this.fetchJson<NhtsaResponse<NhtsaMake>>(this.makesUrl);
        const data = payload.Results
          .map((r) => ({ id: r.Make_ID, name: r.Make_Name.trim() }))
          .filter((m) => !!m.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        this.makesCache = { data, expiresAt: Date.now() + this.cacheTtlMs };
      } catch (err) {
        this.logAndThrow('Unable to load vehicle makes catalog', err);
      }
    }
    const trimmed = search?.trim().toLowerCase();
    if (!trimmed) {
      return this.makesCache!.data;
    }
    return this.makesCache!.data.filter((make) => make.name.toLowerCase().includes(trimmed));
  }

  async getModels(makeId: number, opts?: { search?: string }): Promise<VehicleCatalogModel[]> {
    const cached = this.modelsCache.get(makeId);
    if (!this.isCacheValid(cached)) {
      try {
        const payload = await this.fetchJson<NhtsaResponse<NhtsaModel>>(this.modelsUrl(makeId));
        const data = payload.Results
          .map((r) => ({
            id: r.Model_ID,
            name: r.Model_Name.trim(),
            makeId: r.Make_ID,
            makeName: r.Make_Name.trim(),
          }))
          .filter((m) => !!m.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        this.modelsCache.set(makeId, { data, expiresAt: Date.now() + this.cacheTtlMs });
      } catch (err) {
        this.logAndThrow(`Unable to load models for make ${makeId}`, err);
      }
    }
    let models = this.modelsCache.get(makeId)?.data ?? [];
    const trimmed = opts?.search?.trim().toLowerCase();
    if (trimmed) {
      models = models.filter((model) => model.name.toLowerCase().includes(trimmed));
    }
    return models;
  }
}
