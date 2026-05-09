export default function Footer() {
  return (
    <footer className="bg-[#0D1220] border-t border-[#2A3450] py-6 text-center">
      <div className="font-serif text-base text-amber-300 mb-1">⚖ Legal Bro</div>
      <p className="text-xs text-stone-600">
        © {new Date().getFullYear()} Legal Bro · AI-Powered Legal Document Drafter
      </p>
    </footer>
  );
}
