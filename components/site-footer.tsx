import { THEME } from "@/lib/theme";
import Image from "next/image";

interface SiteFooterProps {
  onNavigate?: (page: string) => void;
}

export default function SiteFooter({ onNavigate }: SiteFooterProps) {
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.location.href = `/${page}`;
    }
  };

  return (
    <footer
      className="border-t py-8 text-sm"
      style={{ borderColor: THEME.cardBorder }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4 text-center md:text-left mb-8">
          {/* 1. Логотип и реквизиты */}
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Image
                src="/images/logo.svg"
                alt="Chaletcoaching Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <div className="font-extrabold tracking-tight">
                Chalet<span style={{ color: THEME.accent }}>coaching</span>
              </div>
            </div>
            <div className="opacity-80 space-y-1 text-sm">
              <div>CHALET AQUARIUS LTD</div>
              <div>Company number: 15587263</div>
              <div>20 Wenlock Road, London, England, N1 7GU</div>
              <div>Email: <a href="mailto:info@chaletcoaching.co.uk" className="underline">info@chaletcoaching.co.uk</a></div>
              <div>Phone: +44 7441 392840</div>
            </div>
          </div>

          {/* 2. Company */}
          <div>
            <div className="font-semibold mb-2">Company</div>
            <ul className="text-sm space-y-1 opacity-85">
              <li><a href="/about" onClick={(e) => { e.preventDefault(); handleNavigate('about'); }} className="hover:opacity-100">About</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); handleNavigate('contact'); }} className="hover:opacity-100">Contact</a></li>
              <li><a href="/faq" onClick={(e) => { e.preventDefault(); handleNavigate('faq'); }} className="hover:opacity-100">FAQ</a></li>
              <li><a href="/support" onClick={(e) => { e.preventDefault(); handleNavigate('support'); }} className="hover:opacity-100">Support</a></li>
              <li><a href="/trust-safety" onClick={(e) => { e.preventDefault(); handleNavigate('trust-safety'); }} className="hover:opacity-100">Trust & safety</a></li>
            </ul>
          </div>

          {/* 3. Links */}
          <div>
            <div className="font-semibold mb-2">Links</div>
            <ul className="text-sm space-y-1 opacity-85">
              <li><Link href="/coaches" onClick={(e) => { e.preventDefault(); handleNavigate('coaches'); }} className="hover:opacity-100">Coaches</Link></li>
              <li><a href="/generator" onClick={(e) => { e.preventDefault(); handleNavigate('generator'); }} className="hover:opacity-100">Courses</a></li>
              <li><a href="/how-it-works" onClick={(e) => { e.preventDefault(); handleNavigate('how-it-works'); }} className="hover:opacity-100">How it Works</a></li>
              <li><a href="/payments-tokens" onClick={(e) => { e.preventDefault(); handleNavigate('payments-tokens'); }} className="hover:opacity-100">Payments & tokens</a></li>
              <li><a href="/pricing" onClick={(e) => { e.preventDefault(); handleNavigate('pricing'); }} className="hover:opacity-100">Pricing</a></li>
              <li><a href="/what-you-receive" onClick={(e) => { e.preventDefault(); handleNavigate('what-you-receive'); }} className="hover:opacity-100">What you receive</a></li>
            </ul>
          </div>

          {/* 4. Политики */}
          <div>
            <div className="font-semibold mb-2">Policies</div>
            <ul className="text-sm space-y-1 opacity-85">
              <li><a href="/legal/refunds" onClick={(e) => { e.preventDefault(); handleNavigate('legal/refunds'); }} className="hover:opacity-100">Refund & Returns Policy</a></li>
              <li><a href="/legal/privacy" onClick={(e) => { e.preventDefault(); handleNavigate('legal/privacy'); }} className="hover:opacity-100">Privacy Policy</a></li>
              <li><a href="/legal/terms" onClick={(e) => { e.preventDefault(); handleNavigate('legal/terms'); }} className="hover:opacity-100">Terms and Conditions</a></li>
              <li><a href="/legal/cookies" onClick={(e) => { e.preventDefault(); handleNavigate('legal/cookies'); }} className="hover:opacity-100">Cookies Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Нижняя секция: Copyright слева, Payment Methods справа */}
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: THEME.cardBorder }}>
          {/* Copyright слева */}
          <div className="text-sm opacity-80 text-center md:text-left">
            © 2025 Chaletcoaching.co.uk | CHALET AQUARIUS LTD | All right reserved
          </div>

          {/* Payment Methods справа */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/visa-logo.svg"
                alt="Visa"
                width={48}
                height={24}
                className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/images/mastercard-logo.svg"
                alt="Mastercard"
                width={48}
                height={24}
                className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
