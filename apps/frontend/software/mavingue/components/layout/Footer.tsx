'use client';

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const currentYear = new Date().getFullYear();

// Icons
const Icons = {
  Location: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  ),
};

export default function Footer() {
  const { t } = useI18n();

  const companyLinks = [
    { label: t("footer.about"), href: "/sobre" },
    { label: t("footer.services"), href: "/servicos" },
    { label: t("nav.projects"), href: "/projetos" },
    { label: t("footer.contact"), href: "/contactos" },
  ];

  const productLinks = [
    { label: t("common.catalog"), href: "/catalogo?cat=construcao" },
    { label: t("footer.productCategories.hardware"), href: "/catalogo?cat=ferragem" },
    { label: t("footer.productCategories.water"), href: "/catalogo?cat=agua" },
    { label: t("footer.productCategories.premium"), href: "/catalogo?cat=premium" },
  ];

  const contactInfo = [
    { icon: Icons.Location, text: t("footer.location") },
    { icon: Icons.Phone, text: t("footer.phone") },
    { icon: Icons.Mail, text: t("footer.email") },
    { icon: Icons.Clock, text: t("footer.hours") },
  ];

  const socialLinks = [
    { icon: Icons.Facebook, label: "Facebook", href: "https://facebook.com/mavingue" },
    { icon: Icons.Instagram, label: "Instagram", href: "https://instagram.com/mavingue" },
    { icon: Icons.LinkedIn, label: "LinkedIn", href: "https://linkedin.com/company/mavingue" },
  ];

  return (
    <footer className="bg-gradient-to-br relative z-6 from-slate-900 via-slate-900 to-slate-950 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-2xl font-black text-white">M</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mavingue</h3>
                <p className="text-xs text-orange-400 uppercase tracking-wider">Materiais de Construção</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {t("footer.aboutText")}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-white hover:bg-orange-500 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
              {t("footer.company")}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-orange-400 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
              {t("footer.products")}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-orange-400 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
              {t("footer.contact")}
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3">
                  <info.icon />
                  <span className="text-sm text-slate-400">{info.text}</span>
                </li>
              ))}
            </ul>
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-slate-400 mb-3">{t("footer.newsletter")}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("footer.newsletterPlaceholder")}
                  className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                <button className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <Icons.ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Mavingue. {t("footer.copyright")}
            </p>
            <div className="flex gap-6">
              <Link href="/privacidade" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link href="/termos" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
                {t("footer.terms")}
              </Link>
              <Link href="/faq" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
                {t("common.faq")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"></div>
    </footer>
  );
}
