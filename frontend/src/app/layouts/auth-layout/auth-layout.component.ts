import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <aside class="auth-aside">
        <div class="logo">
          <span class="logo-mark">+</span>
          <span class="logo-text">Medical CRM</span>
        </div>

        <div class="auth-hero">
          <h1>Платформа для современной клиники</h1>
          <p>Записи на приём, медкарты и общение с пациентами — в одном интерфейсе.</p>
          <ul class="auth-features">
            <li>Управление расписанием и приёмами</li>
            <li>Цифровая медицинская карта</li>
            <li>Семейные врачи и история визитов</li>
          </ul>
        </div>

        <div class="auth-aside-foot muted">© {{ year }} Medical CRM</div>
      </aside>

      <main class="auth-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }

      .auth-shell {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
        min-height: 100vh;
      }

      .auth-aside {
        position: relative;
        padding: var(--space-10);
        display: flex;
        flex-direction: column;
        gap: var(--space-10);
        color: #fff;
        background:
          radial-gradient(80% 60% at 20% 0%, rgba(255, 255, 255, 0.12), transparent 60%),
          radial-gradient(60% 60% at 100% 100%, rgba(255, 255, 255, 0.10), transparent 60%),
          linear-gradient(160deg, var(--brand-700), var(--brand-500) 60%, var(--brand-600));
        overflow: hidden;
      }
      .auth-aside::after {
        content: '';
        position: absolute; inset: 0;
        background:
          repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 28px);
        pointer-events: none;
      }

      .logo { display: flex; align-items: center; gap: var(--space-3); position: relative; z-index: 1; }
      .logo-mark {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: rgba(255,255,255,0.18);
        display: grid; place-items: center;
        font-weight: 700; font-size: 22px; line-height: 1;
        backdrop-filter: blur(8px);
      }
      .logo-text { font-weight: 600; font-size: 18px; letter-spacing: -0.01em; }

      .auth-hero { max-width: 420px; position: relative; z-index: 1; }
      .auth-hero h1 {
        font-size: 36px; line-height: 1.15;
        color: #fff;
        margin-bottom: var(--space-4);
      }
      .auth-hero p { color: rgba(255,255,255,0.85); font-size: 15px; }
      .auth-features {
        margin-top: var(--space-6);
        padding: 0;
        list-style: none;
        display: grid; gap: var(--space-2);
        color: rgba(255,255,255,0.92);
        font-size: 14px;
      }
      .auth-features li {
        position: relative; padding-left: 22px;
      }
      .auth-features li::before {
        content: '';
        position: absolute; left: 0; top: 8px;
        width: 8px; height: 8px; border-radius: 50%;
        background: rgba(255,255,255,0.85);
      }

      .auth-aside-foot {
        position: relative; z-index: 1;
        color: rgba(255,255,255,0.7);
        font-size: 12px;
      }

      .auth-main {
        background: var(--surface-muted);
        display: flex; align-items: center; justify-content: center;
        padding: var(--space-10) var(--space-6);
      }

      @media (max-width: 920px) {
        .auth-shell { grid-template-columns: 1fr; }
        .auth-aside { display: none; }
      }
    `,
  ],
})
export class AuthLayoutComponent {
  protected readonly year = new Date().getFullYear();
}
