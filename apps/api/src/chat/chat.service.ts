import { Injectable } from '@nestjs/common';

interface FAQItem {
  keywords: string[];
  response: string;
}

@Injectable()
export class ChatService {
  private readonly supportPhone = '(555) 123-4567';
  
  private readonly faqs: FAQItem[] = [
    {
      keywords: ['hours', 'open', 'close', 'time', 'when'],
      response: 'We are open Monday-Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 4:00 PM. We are closed on Sundays.',
    },
    {
      keywords: ['appointment', 'book', 'schedule', 'reserve'],
      response: 'You can book an appointment online through our booking page, or call us at ' + this.supportPhone + '. We typically have availability within 2-3 business days.',
    },
    {
      keywords: ['oil change price', 'oil change cost', 'how much oil change'],
      response: 'Our oil change services start at $39.99 for conventional oil and $69.99 for full synthetic oil. This includes up to 5 quarts of oil, a new filter, and a complimentary multi-point inspection. Price may vary based on your vehicle type.',
    },
    {
      keywords: ['tire price', 'tire cost', 'how much tire', 'tire installation'],
      response: 'Tire prices vary by size and brand, typically ranging from $80 to $300 per tire. Installation is $25 per tire and includes mounting, balancing, valve stems, and disposal of old tires. We offer price matching and financing options.',
    },
    {
      keywords: ['brake price', 'brake cost', 'how much brake', 'brake pad'],
      response: 'Brake pad replacement starts at $149.99 per axle for most vehicles. This includes pads, hardware, and labor. If rotors need resurfacing or replacement, prices range from $299 to $499 per axle. We offer a lifetime warranty on brake pads.',
    },
    {
      keywords: ['alignment price', 'alignment cost', 'wheel alignment'],
      response: 'A standard 2-wheel alignment is $79.99, and a 4-wheel alignment is $119.99. This service typically takes about an hour and helps ensure even tire wear and proper handling. We recommend alignment checks annually or if you notice uneven tire wear.',
    },
    {
      keywords: ['diagnostic price', 'diagnostic cost', 'check engine'],
      response: 'Our diagnostic service is $89.99, which is waived if you proceed with the recommended repairs. This includes a complete computerized scan and inspection to identify any issues with your vehicle.',
    },
    {
      keywords: ['battery price', 'battery cost', 'new battery'],
      response: 'Car batteries range from $129 to $249 depending on your vehicle\'s requirements. Installation is free with battery purchase. All our batteries come with a warranty, and we offer free battery testing.',
    },
    {
      keywords: ['rotation price', 'tire rotation cost'],
      response: 'Tire rotation is $29.99 and takes about 20-30 minutes. We recommend rotating your tires every 5,000-7,000 miles to ensure even wear. This service is complimentary with any oil change or tire purchase.',
    },
    {
      keywords: ['inspection price', 'inspection cost', 'safety inspection'],
      response: 'State safety inspections are $25, and emissions testing is $35. A comprehensive pre-purchase vehicle inspection is $149.99 and includes a detailed report of the vehicle\'s condition.',
    },
    {
      keywords: ['transmission price', 'transmission cost', 'transmission service'],
      response: 'Transmission fluid service starts at $149.99. More extensive transmission repairs can range from $500 to $3,500 depending on the issue. We recommend a transmission inspection to provide an accurate quote for your specific needs.',
    },
    {
      keywords: ['ac price', 'air conditioning', 'ac recharge', 'freon'],
      response: 'AC recharge service starts at $149.99 and includes leak testing and up to 1 lb of refrigerant. More extensive AC repairs range from $300 to $1,200. We offer a free AC system diagnosis with any service.',
    },
    {
      keywords: ['price', 'cost', 'how much', 'fee', 'charge', 'pricing', 'estimate'],
      response: 'Our pricing varies based on the service needed. Common services include: Oil changes ($40-$70), Tire installation ($25/tire), Brake service ($150-$499), Alignments ($80-$120), and Diagnostics ($90). For a detailed quote specific to your vehicle, call us at ' + this.supportPhone + ' or book an appointment.',
    },
    {
      keywords: ['service', 'offer', 'what do you', 'provide'],
      response: 'We provide a full range of automotive services including oil changes, tire services, brake repairs, engine diagnostics, and general maintenance. For specific service inquiries, please call ' + this.supportPhone + '.',
    },
    {
      keywords: ['location', 'address', 'where', 'find you'],
      response: 'We are located at 123 Main Street. You can easily find us with GPS navigation. For directions, please call us at ' + this.supportPhone + '.',
    },
    {
      keywords: ['cancel', 'reschedule', 'change appointment'],
      response: 'To cancel or reschedule your appointment, please call us at ' + this.supportPhone + ' at least 24 hours in advance. You can also manage appointments through your account dashboard.',
    },
    {
      keywords: ['payment', 'pay', 'accept', 'credit card', 'cash'],
      response: 'We accept cash, all major credit cards, and debit cards. Payment is due upon completion of service.',
    },
    {
      keywords: ['warranty', 'guarantee'],
      response: 'We stand behind our work with a comprehensive warranty. Specific warranty terms depend on the service provided. Call us at ' + this.supportPhone + ' for details.',
    },
    {
      keywords: ['emergency', 'urgent', 'immediate', 'now', 'asap'],
      response: 'For urgent or emergency service, please call us immediately at ' + this.supportPhone + '. We will do our best to accommodate your needs as quickly as possible.',
    },
    {
      keywords: ['tire', 'tires'],
      response: 'We offer complete tire services including new tire installation, rotation, balancing, and repairs. We carry a wide selection of tire brands to fit your needs and budget.',
    },
    {
      keywords: ['oil change', 'oil'],
      response: 'We offer quick and professional oil change services. Most oil changes take about 30 minutes. You can book an appointment online or walk in during business hours.',
    },
    {
      keywords: ['brake', 'brakes'],
      response: 'We provide comprehensive brake services including inspection, pad replacement, rotor resurfacing, and complete brake system repairs. Safety is our top priority.',
    },
    {
      keywords: ['contact', 'phone', 'call', 'reach'],
      response: 'You can reach us at ' + this.supportPhone + ' during business hours. We\'re happy to answer any questions you may have!',
    },
    {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      response: 'Hello! How can I help you today? Feel free to ask about our services, hours, appointments, or any other questions you may have.',
    },
    {
      keywords: ['thank', 'thanks'],
      response: 'You\'re welcome! If you have any other questions, feel free to ask. Otherwise, you can reach us at ' + this.supportPhone + '.',
    },
  ];

  async generateResponse(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase().trim();

    // Check for greeting first
    if (lowerMessage.length < 3) {
      return this.getDefaultResponse();
    }

    // Find matching FAQ
    for (const faq of this.faqs) {
      if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return faq.response;
      }
    }

    // No match found, return default response with phone number
    return this.getDefaultResponse();
  }

  private getDefaultResponse(): string {
    return `I'm not sure I can answer that question accurately. For the best assistance, please call us at ${this.supportPhone}. Our team will be happy to help you with any questions or concerns!`;
  }
}
