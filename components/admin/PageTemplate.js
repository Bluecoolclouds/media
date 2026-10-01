'use client';

export default function PageTemplate({ title, description, actions, children }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description && (
            <p className="text-white/60 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
