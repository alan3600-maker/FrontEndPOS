import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Structural directive: *hasRol="'ADMIN'" | *hasRol="['ADMIN','CAJERO']"
 *
 * Muestra el template solo si el usuario actual tiene al menos uno de los roles indicados.
 */
@Directive({
  selector: '[hasRol]',
  standalone: true,
})
export class HasRolDirective {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  private rendered = false;

  @Input('hasRol') set hasRol(roles: string | string[]) {
    const ok = Array.isArray(roles)
      ? roles.some((r) => this.auth.hasRole(r))
      : this.auth.hasRole(roles);

    if (ok && !this.rendered) {
      this.vcr.createEmbeddedView(this.tpl);
      this.rendered = true;
    } else if (!ok && this.rendered) {
      this.vcr.clear();
      this.rendered = false;
    }
  }
}
