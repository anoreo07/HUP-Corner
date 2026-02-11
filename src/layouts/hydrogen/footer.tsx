import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-300 bg-gray-0 px-4 py-6 md:px-5 lg:px-6 3xl:px-8 4xl:px-10">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Liên hệ & đóng góp</h3>
        
        <p className="text-center text-gray-600 text-sm mb-4">
          Mọi ý kiến và thắc mắc vui lòng liên hệ qua hupcorner.team@gmail.com. Xin cảm ơn!
        </p>
        <div className="text-gray-400 text-xs">
          © 2026 HUP CORNER. Made with ❤️ for HUP students.
          <span className="mx-2">•</span>
          <Link 
            href="/admin/login" 
            className="hover:text-gray-600 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
