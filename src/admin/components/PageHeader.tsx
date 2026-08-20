import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Primary buttons, rendered on the right. */
  actions?: ReactNode;
  /** Shows a refresh icon button beside the actions when provided. */
  onRefresh?: () => void;
  /** Rendered above the title — typically a back link on form pages. */
  breadcrumb?: ReactNode;
}

/**
 * The standard heading every admin page opens with. The title block takes the
 * leftover space (`margin-right: auto` in CSS) so tools and actions group
 * together on the right rather than spreading apart.
 */
export default function PageHeader({ title, description, actions, onRefresh, breadcrumb }: PageHeaderProps) {
  return (
    <div className="page-header">
      {breadcrumb && <div className="page-header-breadcrumb">{breadcrumb}</div>}
      <div className="page-header-row">
        <div className="page-header-titles">
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-subtitle">{description}</p>}
        </div>
        {onRefresh && (
          <button type="button" className="icon-btn icon-ghost" onClick={onRefresh} title="Refresh">
            <RefreshCw size={16} />
          </button>
        )}
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
