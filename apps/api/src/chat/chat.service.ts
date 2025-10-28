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
      keywords: ['price', 'cost', 'how much', 'fee', 'charge'],
      response: 'Our pricing varies based on the service needed. For a detailed quote, please call us at ' + this.supportPhone + ' or book an appointment for an estimate.',
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
