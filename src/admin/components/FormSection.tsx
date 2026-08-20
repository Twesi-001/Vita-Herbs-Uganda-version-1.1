import type { ReactNode } from 'react';

interface FormSectionProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Applied to the body, so callers can supply their own grid. */
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * A titled card that groups related fields. Form pages stack several of these
 * in a single column rather than using tabs, so the whole record stays
 * scannable and submits as one form.
 */
export default function FormSection({
  icon, title, description, bodyClassName, children,
}: FormSectionProps) {
  return (
    <section className="form-section">
      <div className="form-section-head">
        {icon && <span className="form-section-icon">{icon}</span>}
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>
      <div className={`form-section-body ${bodyClassName ?? ''}`}>{children}</div>
    </section>
  );
}
