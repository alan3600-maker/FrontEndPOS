import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  standalone: true,
  selector: '[hasPermiso]',
})
export class HasPermisoDirective {
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef<any>);
  private readonly vcr = inject(ViewContainerRef);

  private permisos: string[] = [];

  @Input('hasPermiso')
  set hasPermiso(value: string | string[]) {
    this.permisos = Array.isArray(value) ? value : [value];
    this.render();
  }

  constructor() {
    // re-render cuando cambie auth() (signal)
    effect(() => {
      this.auth.auth(); // dependencia
      this.render();
    });
  }

  private render() {
    const ok = this.auth.hasPermiso(...this.permisos);
    this.vcr.clear();
    if (ok) this.vcr.createEmbeddedView(this.tpl);
  }
}
