import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

/**
 * Desativa o corretor nativo do navegador em campos de texto do wizard.
 * Sem isso, textos em pt-BR aparecem com sublinhado vermelho quando o
 * dicionário do browser não inclui português.
 */
@Directive({
  selector: '[appDisableSpellcheck]',
  standalone: true,
})
export class DisableSpellcheckDirective implements AfterViewInit, OnDestroy {
  private observer?: MutationObserver;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.apply();
    this.observer = new MutationObserver(() => this.apply());
    this.observer.observe(this.host.nativeElement, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private apply(): void {
    const selector = 'textarea, input[type="text"], input[type="search"], input:not([type])';
    this.host.nativeElement.querySelectorAll(selector).forEach((node) => {
      (node as HTMLTextAreaElement | HTMLInputElement).spellcheck = false;
    });
  }
}
