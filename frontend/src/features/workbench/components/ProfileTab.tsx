import {
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Languages,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatHeight, formatIncome, humanize } from '@/lib/format';
import type { Customer } from '@/types';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value == null || value === '' || (Array.isArray(value) && value.length === 0);
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{empty ? '—' : value}</dd>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-soft/50 text-rose-deep">
          {icon}
        </span>
        <h3 className="font-serif text-lg text-ink">{title}</h3>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">{children}</dl>
    </Card>
  );
}

function Chips({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'rose' | 'sage' | 'gold' }) {
  if (!items?.length) return <>—</>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Badge key={i} tone={tone}>
          {i}
        </Badge>
      ))}
    </div>
  );
}

export function ProfileTab({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-5">
      <Section title="Personal & Core" icon={<Heart className="h-4 w-4" />}>
        <Field label="Full Name" value={`${customer.firstName} ${customer.lastName}`} />
        <Field label="Gender" value={humanize(customer.gender)} />
        <Field label="Age" value={`${customer.age} years`} />
        <Field label="Height" value={formatHeight(customer.height)} />
        <Field label="City" value={`${customer.city}, ${customer.country}`} />
        <Field label="Marital Status" value={humanize(customer.maritalStatus)} />
        <Field label="Email" value={customer.email} />
        <Field label="Phone" value={customer.phone} />
        <Field label="Mother Tongue" value={customer.motherTongue} />
      </Section>

      <Section title="Career & Education" icon={<Briefcase className="h-4 w-4" />}>
        <Field label="Designation" value={customer.designation} />
        <Field label="Company" value={customer.currentCompany} />
        <Field label="Income" value={formatIncome(customer.income)} />
        <Field label="Degree" value={customer.degree} />
        <Field label="College" value={customer.undergraduateCollege} />
        <Field label="Education Preference" value={customer.educationPreference} />
      </Section>

      <Section title="Background & Family" icon={<Users className="h-4 w-4" />}>
        <Field label="Religion" value={customer.religion} />
        <Field label="Caste" value={customer.caste} />
        <Field label="Family Type" value={humanize(customer.familyType)} />
        <Field label="Siblings" value={customer.siblings} />
        <Field label="Manglik" value={humanize(customer.manglik)} />
        <Field label="Family Expectations" value={customer.familyExpectations} />
      </Section>

      <Section title="Lifestyle" icon={<Languages className="h-4 w-4" />}>
        <Field label="Diet" value={humanize(customer.dietPreference)} />
        <Field label="Smoking" value={humanize(customer.smokingPreference)} />
        <Field label="Drinking" value={humanize(customer.drinkingPreference)} />
        <Field label="Languages" value={<Chips items={customer.languagesKnown} />} />
        <Field label="Open to Pets" value={humanize(customer.openToPets)} />
        <Field label="Open to Relocate" value={humanize(customer.openToRelocate)} />
        <Field label="Lifestyle" value={<Chips items={customer.lifestylePreferences} tone="gold" />} />
      </Section>

      <Section title="Partner Preferences" icon={<Home className="h-4 w-4" />}>
        <Field label="Want Kids" value={humanize(customer.wantKids)} />
        <Field
          label="Partner Age"
          value={
            customer.partnerAgePreferenceMin && customer.partnerAgePreferenceMax
              ? `${customer.partnerAgePreferenceMin}–${customer.partnerAgePreferenceMax} years`
              : '—'
          }
        />
        <Field label="Preferred Cities" value={<Chips items={customer.preferredCities} />} />
        <Field label="Relationship Goals" value={customer.relationshipGoals} />
      </Section>

      <Section title="Values & Non-Negotiables" icon={<Sparkles className="h-4 w-4" />}>
        <Field label="Core Values" value={<Chips items={customer.coreValues} tone="sage" />} />
        <Field label="Non-Negotiables" value={<Chips items={customer.nonNegotiables} tone="rose" />} />
      </Section>
    </div>
  );
}
