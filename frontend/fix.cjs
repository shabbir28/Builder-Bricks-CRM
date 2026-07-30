const fs = require('fs');

const file = 'src/pages/Properties.jsx';
let code = fs.readFileSync(file, 'utf8');

const anchor = `                  {/* Feature pills */}`;
const brokenTail = `              <option value="rented"    style={{ background: '#0e1015' }}>Rented</option>`;

const replacement = `                  {/* Feature pills */}
                  <div className="flex items-center gap-2">
                    {[
                      { label: \`\${p.bedrooms ?? 0} Bed\` },
                      { label: \`\${p.bathrooms ?? 0} Bath\` },
                      { label: \`\${Number(p.area || 0).toLocaleString()} sqft\` },
                    ].map((feat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-ink-secondary"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {feat.label}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-divide mt-auto">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded-lg flex items-center justify-center text-[9px] font-bold"
                        style={{ background: 'rgba(92,107,192,0.12)', color: '#9fa8da', border: '1px solid rgba(92,107,192,0.2)' }}
                      >
                        {p.listedByUser?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-xs text-ink-tertiary">{p.listedByUser?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                      <EyeIcon className="h-3.5 w-3.5" />
                      {p.views ?? 0}
                    </div>
                  </div>

                  {/* Payment Plan Info (Elite One) */}
                  {p.downPaymentAmount && (
                    <div className="mt-3 pt-3 border-t border-surface-border">
                      <div className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold mb-2">Payment Plan</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Downpayment</span>
                          <span className="font-semibold text-ink-primary">Rs. {(p.downPaymentAmount/1e5).toFixed(1)} Lac</span>
                        </div>
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Monthly ({p.installmentMonths}m)</span>
                          <span className="font-semibold text-emerald-400">Rs. {(p.monthlyInstallment/1e5).toFixed(2)} Lac</span>
                        </div>
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Possession</span>
                          <span className="font-semibold text-ink-primary">Rs. {(p.possessionAmount/1e5).toFixed(1)} Lac</span>
                        </div>
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Remaining</span>
                          <span className="font-semibold text-amber-400">Rs. {(p.remainingAmount/1e5).toFixed(1)} Lac</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* ── Add / Edit Modal ── */}
    <ModalShell
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={editingProp ? 'Edit Property' : 'Add Property'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <F label="Property Type *">
            <select className={inp} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} required>
              {['apartment','house','villa','commercial','land'].map(t => <option key={t} value={t} style={{ background: '#0e1015' }} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </F>
          <F label="Status">
            <select className={inp} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="available" style={{ background: '#0e1015' }}>Available</option>
              <option value="sold"      style={{ background: '#0e1015' }}>Sold</option>
              <option value="rented"    style={{ background: '#0e1015' }}>Rented</option>`;

const startIndex = code.indexOf(anchor);
const endIndex = code.indexOf(brokenTail) + brokenTail.length;

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync(file, code);
  console.log('Fixed successfully');
} else {
  console.log('Could not find boundaries', startIndex, endIndex);
}
