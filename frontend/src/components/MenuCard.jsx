import { formatCurrency } from '../utils/format';

export default function MenuCard({ item, onAdd }) {
  return (
    <article className="card flex flex-col overflow-hidden transition hover:border-brand-500/30">
      <div className="h-40 overflow-hidden">
  <img
 src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
    alt={item.name}
    className="h-full w-full object-cover"
    onError={(e) => {
    e.target.src ='https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
    }}
  />
</div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white">{item.name}</h3>
          <span className="shrink-0 text-sm font-bold text-brand-400">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="mb-4 flex-1 text-sm text-slate-400 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{item.prepTimeMinutes} min</span>
          <button
            type="button"
            onClick={() => onAdd(item)}
            disabled={!item.isAvailable}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            {item.isAvailable ? 'Add' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
}
