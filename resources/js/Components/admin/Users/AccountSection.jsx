import AccountCard from "./AccountCard";
export default function AccountSection({ title, accounts, icon, color }) {
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`text-base ${color}`}>{icon}</span>
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {title}
        </h4>
        <span className="ml-auto bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
          {accounts.length}
        </span>
      </div>

      {accounts.length ? (
        <div className="flex flex-col gap-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic px-1">Sin cuentas de este tipo.</div>
      )}
    </div>
  );
}