import { Injectable } from '@nestjs/common';

interface FAQItem {
  keywords: string[];
  response: string;
  question?: string;
}

interface ChatResponse {
  reply: string;
  similarQuestions?: SimilarQuestion[];
}

interface SimilarQuestion {
  question: string;
  keywords: string[];
}

@Injectable()
export class ChatService {
  private readonly supportPhone = '(555) 123-4567';
  
  private readonly faqs: FAQItem[] = [
    {
      keywords: ['hours', 'open', 'close', 'time', 'when'],
      response: 'We are open Monday-Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 4:00 PM. We are closed on Sundays.',
      question: 'What are your hours of operation?',
    },
    {
      keywords: ['appointment', 'book', 'schedule', 'reserve'],
      response: 'You can book an appointment online through our booking page, or call us at ' + this.supportPhone + '. We typically have availability within 2-3 business days.',
      question: 'How do I book an appointment?',
    },
    {
      keywords: ['oil change price', 'oil change cost', 'how much oil change'],
      response: 'Our oil change services start at $39.99 for conventional oil and $69.99 for full synthetic oil. This includes up to 5 quarts of oil, a new filter, and a complimentary multi-point inspection. Price may vary based on your vehicle type.',
      question: 'How much does an oil change cost?',
    },
    {
      keywords: ['tire price', 'tire cost', 'how much tire', 'tire installation'],
      response: 'Tire prices vary by size and brand, typically ranging from $80 to $300 per tire. Installation is $25 per tire and includes mounting, balancing, valve stems, and disposal of old tires. We offer price matching and financing options.',
      question: 'How much do tires cost?',
    },
    {
      keywords: ['brake price', 'brake cost', 'how much brake', 'brake pad'],
      response: 'Brake pad replacement starts at $149.99 per axle for most vehicles. This includes pads, hardware, and labor. If rotors need resurfacing or replacement, prices range from $299 to $499 per axle. We offer a lifetime warranty on brake pads.',
      question: 'How much does brake service cost?',
    },
    {
      keywords: ['alignment price', 'alignment cost', 'wheel alignment'],
      response: 'A standard 2-wheel alignment is $79.99, and a 4-wheel alignment is $119.99. This service typically takes about an hour and helps ensure even tire wear and proper handling. We recommend alignment checks annually or if you notice uneven tire wear.',
      question: 'How much does wheel alignment cost?',
    },
    {
      keywords: ['diagnostic price', 'diagnostic cost', 'check engine'],
      response: 'Our diagnostic service is $89.99, which is waived if you proceed with the recommended repairs. This includes a complete computerized scan and inspection to identify any issues with your vehicle.',
      question: 'How much does a diagnostic check cost?',
    },
    {
      keywords: ['battery price', 'battery cost', 'new battery'],
      response: 'Car batteries range from $129 to $249 depending on your vehicle\'s requirements. Installation is free with battery purchase. All our batteries come with a warranty, and we offer free battery testing.',
      question: 'How much does a car battery cost?',
    },
    {
      keywords: ['rotation price', 'tire rotation cost'],
      response: 'Tire rotation is $29.99 and takes about 20-30 minutes. We recommend rotating your tires every 5,000-7,000 miles to ensure even wear. This service is complimentary with any oil change or tire purchase.',
      question: 'How much does tire rotation cost?',
    },
    {
      keywords: ['inspection price', 'inspection cost', 'safety inspection'],
      response: 'State safety inspections are $25, and emissions testing is $35. A comprehensive pre-purchase vehicle inspection is $149.99 and includes a detailed report of the vehicle\'s condition.',
      question: 'How much does a vehicle inspection cost?',
    },
    {
      keywords: ['transmission price', 'transmission cost', 'transmission service'],
      response: 'Transmission fluid service starts at $149.99. More extensive transmission repairs can range from $500 to $3,500 depending on the issue. We recommend a transmission inspection to provide an accurate quote for your specific needs.',
      question: 'How much does transmission service cost?',
    },
    {
      keywords: ['ac price', 'air conditioning', 'ac recharge', 'freon'],
      response: 'AC recharge service starts at $149.99 and includes leak testing and up to 1 lb of refrigerant. More extensive AC repairs range from $300 to $1,200. We offer a free AC system diagnosis with any service.',
      question: 'How much does AC service cost?',
    },
    {
      keywords: ['price', 'cost', 'how much', 'fee', 'charge', 'pricing', 'estimate'],
      response: 'Our pricing varies based on the service needed. Common services include: Oil changes ($40-$70), Tire installation ($25/tire), Brake service ($150-$499), Alignments ($80-$120), and Diagnostics ($90). For a detailed quote specific to your vehicle, call us at ' + this.supportPhone + ' or book an appointment.',
      question: 'What are your service prices?',
    },
    {
      keywords: ['service', 'offer', 'what do you', 'provide'],
      response: 'We provide a full range of automotive services including oil changes, tire services, brake repairs, engine diagnostics, and general maintenance. For specific service inquiries, please call ' + this.supportPhone + '.',
      question: 'What services do you offer?',
    },
    {
      keywords: ['location', 'address', 'where', 'find you'],
      response: 'We are located at 123 Main Street. You can easily find us with GPS navigation. For directions, please call us at ' + this.supportPhone + '.',
      question: 'Where are you located?',
    },
    {
      keywords: ['cancel', 'reschedule', 'change appointment'],
      response: 'To cancel or reschedule your appointment, please call us at ' + this.supportPhone + ' at least 24 hours in advance. You can also manage appointments through your account dashboard.',
      question: 'How do I cancel or reschedule an appointment?',
    },
    {
      keywords: ['payment', 'pay', 'accept', 'credit card', 'cash'],
      response: 'We accept cash, all major credit cards, and debit cards. Payment is due upon completion of service.',
      question: 'What payment methods do you accept?',
    },
    {
      keywords: ['warranty', 'guarantee'],
      response: 'We stand behind our work with a comprehensive warranty. Specific warranty terms depend on the service provided. Call us at ' + this.supportPhone + ' for details.',
      question: 'Do you offer a warranty?',
    },
    {
      keywords: ['emergency', 'urgent', 'immediate', 'now', 'asap'],
      response: 'For urgent or emergency service, please call us immediately at ' + this.supportPhone + '. We will do our best to accommodate your needs as quickly as possible.',
      question: 'Do you offer emergency services?',
    },
    {
      keywords: ['tire', 'tires'],
      response: 'We offer complete tire services including new tire installation, rotation, balancing, and repairs. We carry a wide selection of tire brands to fit your needs and budget.',
      question: 'What tire services do you offer?',
    },
    {
      keywords: ['oil change', 'oil'],
      response: 'We offer quick and professional oil change services. Most oil changes take about 30 minutes. You can book an appointment online or walk in during business hours.',
      question: 'Do you offer oil changes?',
    },
    {
      keywords: ['brake', 'brakes'],
      response: 'We provide comprehensive brake services including inspection, pad replacement, rotor resurfacing, and complete brake system repairs. Safety is our top priority.',
      question: 'What brake services do you offer?',
    },
    {
      keywords: ['contact', 'phone', 'call', 'reach'],
      response: 'You can reach us at ' + this.supportPhone + ' during business hours. We\'re happy to answer any questions you may have!',
      question: 'How can I contact you?',
    },
    {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      response: 'Hello! How can I help you today? Feel free to ask about our services, hours, appointments, or any other questions you may have.',
      question: 'Hello',
    },
    {
      keywords: ['thank', 'thanks'],
      response: 'You\'re welcome! If you have any other questions, feel free to ask. Otherwise, you can reach us at ' + this.supportPhone + '.',
      question: 'Thank you',
    },
  ];

  async generateResponse(message: string): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase().trim();

    // Check for greeting first
    if (lowerMessage.length < 3) {
      return {
        reply: this.getDefaultResponse(),
        similarQuestions: this.getSimilarQuestions([]),
      };
    }

    // Find matching FAQ
    let matchedFaq: FAQItem | null = null;
    const matchedKeywords: string[] = [];

    for (const faq of this.faqs) {
      const matched = faq.keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matched.length > 0) {
        matchedFaq = faq;
        matchedKeywords.push(...matched);
        break;
      }
    }

    if (matchedFaq) {
      // Extract all keywords from the user's message
      const userKeywords = this.extractKeywords(lowerMessage);
      
      return {
        reply: matchedFaq.response,
        similarQuestions: this.getSimilarQuestions([...matchedKeywords, ...userKeywords], matchedFaq),
      };
    }

    // No match found, return default response with general similar questions
    const userKeywords = this.extractKeywords(lowerMessage);
    return {
      reply: this.getDefaultResponse(),
      similarQuestions: this.getSimilarQuestions(userKeywords),
    };
  }

  private extractKeywords(message: string): string[] {
    // Extract potential keywords from the message
    const words = message.split(/\s+/);
    const meaningfulWords = words.filter(word => 
      word.length > 2 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'she', 'too', 'use'].includes(word)
    );
    return meaningfulWords;
  }

  private getSimilarQuestions(keywords: string[], excludeFaq?: FAQItem): SimilarQuestion[] {
    if (keywords.length === 0) {
      // Return some popular questions if no keywords
      return this.faqs
        .filter(faq => faq !== excludeFaq && faq.question)
        .slice(0, 3)
        .map(faq => ({
          question: faq.question!,
          keywords: faq.keywords,
        }));
    }

    // Score each FAQ based on keyword overlap
    const scoredFaqs = this.faqs
      .filter(faq => faq !== excludeFaq && faq.question)
      .map(faq => {
        let score = 0;
        
        // Check for exact keyword matches
        for (const keyword of keywords) {
          if (faq.keywords.some(faqKeyword => faqKeyword.includes(keyword) || keyword.includes(faqKeyword))) {
            score += 2;
          }
        }

        // Check for related words (partial matches)
        for (const userKeyword of keywords) {
          for (const faqKeyword of faq.keywords) {
            // Check if keywords share common roots or are related
            if (this.areKeywordsRelated(userKeyword, faqKeyword)) {
              score += 1;
            }
          }
        }

        return { faq, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return scoredFaqs.map(item => ({
      question: item.faq.question!,
      keywords: item.faq.keywords,
    }));
  }

  private areKeywordsRelated(keyword1: string, keyword2: string): boolean {
    // Simple relatedness check - can be expanded with more sophisticated logic
    const relatedGroups = [
      ['price', 'cost', 'charge', 'fee', 'pricing', 'estimate', 'much'],
      ['oil', 'change', 'service', 'maintenance'],
      ['tire', 'tires', 'wheel', 'rotation'],
      ['brake', 'brakes', 'pad', 'rotor'],
      ['appointment', 'book', 'schedule', 'reserve'],
      ['hours', 'open', 'close', 'time', 'when'],
      ['location', 'address', 'where', 'find'],
      ['payment', 'pay', 'accept', 'card', 'cash'],
    ];

    for (const group of relatedGroups) {
      if (group.includes(keyword1) && group.includes(keyword2)) {
        return true;
      }
    }

    return false;
  }

  private getDefaultResponse(): string {
    return `I'm not sure I can answer that question accurately. For the best assistance, please call us at ${this.supportPhone}. Our team will be happy to help you with any questions or concerns!`;
  }
}
