import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, AfterViewChecked, AfterViewInit, ViewChild, signal, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';


interface TerminalLine {
  type: 'output' | 'command';
  text: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewChecked, AfterViewInit {

  constructor(private cdr: ChangeDetectorRef,
              private messageService:MessageService){}

  backendExpanded = signal<string | null>(null);
  toggleBackend(name:string):void{
    this.backendExpanded.update(current => current === name ? null : name);
  }

  expandedCard = signal<string | null>(null);
  mobileMenuOpen = signal(false);

  openCard(name:string):void {
    this.expandedCard.set(name);
  }

  closeCard():void{
     this.expandedCard.set(null);
  }

  @HostListener('document:keydown.escape')
  closeModalWithEscape(): void {
    this.closeCard();
  }

  toggleMobileMenu():void{
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu():void{
    this.mobileMenuOpen.set(false);
  }

  private introLines: string[] = [
    'Carlos_Rojas@dev',
    '--------------------',
    'Rol:: Full Stack Developer',
    'Backend:: Node.js · Spring Boot · Laravel · Odoo',
    'Frontend:: Angular · Astro · Next.js · Odoo',
    'Móvil:: React Native · Kotlin',
    'Infra:: Arch Linux · Ubuntu Server',
    'Base de Datos:: Oracle · MySQL · MongoDB · PostgreSQL',
    'Info:: Puedes escribir "help"'
  ];

  history = signal<TerminalLine[]>([]);
  currentTypingText = signal('');
  introFinished = signal(false);
  userInput = '';
  quickCommands = ['about', 'skills', 'experience', 'projects', 'contact'];

  contactMessage = '';
  contactStatus = signal<'ok' | 'error' | null>(null);
  contactStatusText = signal('');
   contactLoading = signal(false);

  @ViewChild('terminalBody') terminalBody!: ElementRef<HTMLDivElement>;
  @ViewChild('commandInput') commandInput!: ElementRef<HTMLInputElement>;

    @ViewChild('contactInput') contactInput!: ElementRef<HTMLTextAreaElement>;

  private shouldScroll = false;

  private commands: Record<string, () => string[]> = {
    help: () => [
      'Comandos disponibles:',
      '  about     - sobre mí',
      '  skills    - stack tecnológico',
      '  experience - experiencia profesional',
      '  contact   - datos de contacto',
      '  clear     - limpiar terminal',
    ],
    about: () => [
      'Desarrollador Full Stack apasionado por sistemas',
      'que van desde el servidor hasta la pantalla.'
    ],
    skills: () => [
      'Backend:: Node.js · Spring Boot · Laravel · Odoo',
      'Frontend:: Angular · Astro · Next.js · Odoo',
      'Móvil:: React Native · Kotlin'
    ],
    experience: () => [
      'Experiencia:: sistemas empresariales e infraestructura',
      'Responsabilidades:: APIs · datos · despliegue · mantenimiento'
    ],
    projects: () => [
      'Proyectos:: librería SUNAT · ERP · e-commerce · app móvil',
      'Stack:: Nest.js · Angular · Next.js · Docker · Redis',
      'Escribe "contact" para conversar conmigo.'
    ],
    contact: () => [
      'Email:: carlos.rojas.ramirez.25@gmail.com'
    ],
    whoami: () => ['Carlos_Rojas'],
  };

  ngOnInit(): void {
    this.playIntro();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngAfterViewInit(): void {
    const cards = document.querySelectorAll<HTMLElement>('.reveal-on-scroll');

    if (!('IntersectionObserver' in window)) {
      cards.forEach(card => card.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach(card => observer.observe(card));
  }

  private async playIntro() {
    for (const line of this.introLines) {
      await this.typeLine(line);
      this.history.update(h => [...h, { type: 'output', text: line }]);
      this.currentTypingText.set('');
      this.cdr.detectChanges();
    }

    this.introFinished.set(true);
    this.cdr.detectChanges();
    setTimeout(() => this.commandInput?.nativeElement.focus(), 0);
  }

  private typeLine(line: string, speedMs = 18): Promise<void> {
    return new Promise((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        this.currentTypingText.set(line.slice(0, i));
        this.shouldScroll = true;
        this.cdr.detectChanges(); // CLAVE: fuerza el repintado en cada letra
        if (i >= line.length) {
          clearInterval(interval);
          resolve();
        }
      }, speedMs);
    });
  }

  onEnter(): void {
    const raw = this.userInput.trim();
    if (!raw) return;

    this.runCommand(raw);
  }

  runCommand(command: string): void {
    const raw = command.trim();
    if (!raw) return;

    this.history.update(h => [...h, { type: 'command', text: raw }]);

    if (raw.toLocaleLowerCase() === 'clear') {
      this.history.set([]);
    } else {
      const handler = this.commands[raw.toLocaleLowerCase()];
      const output = handler ? handler() : [`Comando no encontrado: ${raw}. Escribe "help".`];
      this.history.update(h => [...h, ...output.map(text => ({ type: 'output' as const, text }))]);
    }

    this.userInput = '';
    this.shouldScroll = true;
    this.cdr.detectChanges();
  }

  private resetTextareaHeight(): void {
  const el = this.contactInput?.nativeElement;
  if (el) {
    el.style.height = 'auto';
  }
}
async sendContact(): Promise<void> {
    const mensaje = this.contactMessage.trim();
    if (!mensaje) return;

    this.contactLoading.set(true);
    this.contactStatus.set(null);
    this.cdr.detectChanges();

    const ok = await this.messageService.sendMessage(mensaje);

    this.contactLoading.set(false);
    this.contactStatus.set(ok ? 'ok' : 'error');
    this.contactStatusText.set(
      ok ? '✔ Mensaje enviado correctamente. ¡Gracias!' : '✖ Hubo un error, intenta de nuevo.'
    );

    if (ok) {this.contactMessage = '';
    this.cdr.detectChanges();
    this.resetTextareaHeight();
  }
  
  }

  focusInput(): void {
    this.commandInput?.nativeElement.focus();
  }

  private scrollToBottom(): void {
    const el = this.terminalBody?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  focusContactInput(): void {
    this.contactInput?.nativeElement.focus();
  }

  onContactEnter(event: Event): void {
    event.preventDefault(); // evita el salto de línea del textarea
    this.sendContact();
     
  }

  onContactInput(event: Event) {
  const el = event.target as HTMLTextAreaElement;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
}
