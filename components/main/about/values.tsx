"use client";
import { motion } from "framer-motion";
import { 
    ShieldCheck, // Kepercayaan/Verifikasi
    Lightbulb,    // Inovasi/Teknologi
    Scale,        // Transparansi/Keadilan Harga
    UserCheck     // Profesionalisme/Fokus pada Klien
} from "lucide-react";

export default function Values() {
    const PRIMARY_COLOR = "#003366"; // Biru Gelap
    const ACCENT_COLOR = "#00BFFF"; // Biru Muda

    const values = [
        {
            icon: <ShieldCheck className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />,
            title: "Kepercayaan & Verifikasi",
            description:
                "Setiap listing properti diverifikasi secara ketat untuk menjamin keabsahan legalitas dan data, memberikan rasa aman total bagi pembeli dan penjual.",
        },
        {
            icon: <Lightbulb className="w-8 h-8" style={{ color: ACCENT_COLOR }} />,
            title: "Inovasi Properti (PropTech)",
            description:
                "Kami terus mengembangkan teknologi (AI, VR Tours, Simulasi KPR real-time) untuk menciptakan pengalaman mencari dan menjual properti yang paling efisien.",
        },
        {
            icon: <Scale className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />,
            title: "Transparansi Harga",
            description:
                "Kami berkomitmen pada keterbukaan data dan proses, memastikan harga properti yang ditampilkan adalah akurat dan adil bagi semua pihak.",
        },
        {
            icon: <UserCheck className="w-8 h-8" style={{ color: ACCENT_COLOR }} />,
            title: "Profesionalisme Klien",
            description:
                "Semua layanan kami berfokus pada kebutuhan klien, didukung oleh tim agen berlisensi yang siap memberikan panduan ahli di setiap langkah transaksi.",
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                        Nilai Inti{" "}
                        <span style={{ color: PRIMARY_COLOR }}>NESTAR</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Prinsip yang memandu setiap inovasi dan layanan kami dalam
                        menciptakan masa depan properti yang lebih baik.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="text-center bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                        >
                            <div className="mb-6 flex justify-center">
                                {/* Latar belakang ikon menggunakan warna netral agar ikon menonjol */}
                                <div className="p-4 rounded-2xl bg-gray-100 group-hover:scale-110 transform transition duration-300">
                                    {value.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                {value.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}