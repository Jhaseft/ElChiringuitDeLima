
export default function AccountCard({ account }) {
    const isOrigin = account.account_type === "origin";
    const countryFlag = (country) => {
        const flags = {
            peru: "🇵🇪",
            bolivia: "🇧🇴",
            argentina: "🇦🇷",
            chile: "🇨🇱",
            colombia: "🇨🇴",
            mexico: "🇲🇽",
        };
        return flags[country?.toLowerCase()] ?? "🏦";
    };

    return (
        <div className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">

            <div className="shrink-0 w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                {account.bank?.logo_url ? (
                    <img
                        src={account.bank.logo_url}
                        alt={account.bank.name}
                        className="w-full h-full object-contain p-1"
                    />
                ) : (
                    <span className="text-2xl">{countryFlag(account.bank?.country)}</span>
                )}
            </div>


            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                        {account.bank?.name ?? "—"}
                    </p>
                    <span className="text-xs text-gray-400">
                        {countryFlag(account.bank?.country)}{" "}
                        <span className="capitalize">{account.bank?.country}</span>
                    </span>
                </div>

                <p className="text-xs text-gray-500 mt-1 font-mono tracking-wider truncate">
                    {account.account_number}
                </p>


                {account.owner ? (
                    <div className="mt-2 flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {account.owner.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div className="text-xs text-blue-800 leading-tight">
                            <p className="font-semibold">{account.owner.full_name}</p>
                            <p className="text-blue-600">
                                CI: {account.owner.document_number} · {account.owner.phone}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="mt-1 text-xs text-gray-400 italic">Sin titular registrado</p>
                )}
            </div>


            <div className="shrink-0">
                <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isOrigin
                            ? "bg-green-100 text-green-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                >
                    {isOrigin ? "↑ Origen" : "↓ Destino"}
                </span>
            </div>
        </div>
    );
}
