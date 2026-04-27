export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Page title */}
        <h1 className="text-4xl font-bold text-foreground mb-2">Disclaimer</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <p className="text-base text-foreground leading-relaxed mb-10">
          +1 Chopsticks is an online marketplace that connects international travelers with independent
          local host families in Shanghai for authentic home dining experiences. We do not prepare, cook,
          or serve any food. When you complete a booking, you enter into a direct arrangement with the
          host. +1 Chopsticks acts solely as an intermediary platform.
        </p>

        <Section title="We Are a Platform, Not a Food Provider">
          +1 Chopsticks does not prepare, serve, or control any meals or dining experiences listed on our
          platform. All culinary experiences are provided by independent hosts who are not employees,
          agents, or representatives of +1 Chopsticks.
        </Section>

        <Section title="Host Screening">
          While we conduct a host verification and onboarding process, +1 Chopsticks makes no warranty
          as to the identity, character, conduct, or culinary standards of any host, and assumes no
          responsibility for a host's compliance with applicable laws and regulations in the People's
          Republic of China.
        </Section>

        <Section title="Food Allergies &amp; Dietary Requirements">
          Guests are solely responsible for communicating all food allergies, intolerances, and dietary
          restrictions to the host at the time of booking. +1 Chopsticks is not liable for any adverse
          reactions, illness, or injury arising from meals consumed during an experience.
        </Section>

        <Section title="No Warranties">
          Our platform and all experiences listed on it are provided "as is" without warranty of any
          kind, express or implied, including but not limited to warranties of merchantability, fitness
          for a particular purpose, or uninterrupted service. We do not guarantee that any experience
          will meet your specific expectations.
        </Section>

        <Section title="Limitation of Liability">
          To the fullest extent permitted by applicable law, +1 Chopsticks shall not be liable for any
          direct, indirect, incidental, consequential, or punitive damages arising from your
          participation in any dining experience, including but not limited to personal injury, illness,
          property loss or damage, or any incidents occurring at a host's private residence.
        </Section>

        <Section title="Force Majeure">
          +1 Chopsticks shall not be liable for any failure or delay in performance caused by events
          beyond our reasonable control, including severe weather, government restrictions, or other
          unforeseen circumstances.
        </Section>

        <Section title="Changes to This Disclaimer">
          We may update this disclaimer from time to time. Continued use of the platform after any
          update constitutes your acceptance of the revised terms.
        </Section>

        <Section title="Emergency Situations">
          If you experience an emergency during your dining experience, contact local services
          immediately:
          <div className="mt-3 flex flex-wrap gap-4">
            <EmergencyBadge label="Police" number="110" />
            <EmergencyBadge label="Medical" number="120" />
            <EmergencyBadge label="Fire" number="119" />
          </div>
        </Section>

        <div className="mt-10 pt-8 border-t text-sm text-muted-foreground">
          Questions? Contact us at{" "}
          <a
            href="mailto:foodie@plus1chopsticks.com"
            className="text-red-600 hover:underline"
          >
            foodie@plus1chopsticks.com
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <p className="text-base text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function EmergencyBadge({ label, number }: { label: string; number: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
      <span className="text-sm font-semibold text-red-800">{label}:</span>
      <span className="text-sm font-bold text-red-600">{number}</span>
    </div>
  );
}
