/** 1ボタン＝1フォーム。値は hidden で送るため、submitter の name/value に依存しない */
export default function ActionButton({ action, fields, children, className = "btn btn-sm", disabled, title }: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <form action={action} style={{ display: "contents" }}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className={className} disabled={disabled} title={title}>{children}</button>
    </form>
  );
}
