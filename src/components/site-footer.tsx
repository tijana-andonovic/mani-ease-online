import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-secondary/40 mt-24 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg">
            Maison<span className="text-primary">Lune</span>
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            A quiet nail atelier for considered hands. Small team, unhurried appointments.
          </p>
        </div>
        <div>
          <p className="eyebrow">Visit</p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            12 Knez Mihailova
            <br />
            Belgrade, Serbia
          </p>
        </div>
        <div>
          <p className="eyebrow">Hours</p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Mon – Sat, 09:00 – 18:00
            <br />
            Sunday closed
          </p>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/services" className="text-muted-foreground hover:text-foreground">
                Services
              </Link>
            </li>
            <li>
              <Link to="/book" className="text-muted-foreground hover:text-foreground">
                Book an appointment
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-muted-foreground border-t px-5 py-5 text-center text-xs">
        © {new Date().getFullYear()} MaisonLune Nail Atelier
      </div>
    </footer>
  );
}
