import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Ekstrakurikuler from './Ekstrakurikuler';
import { ExtracurricularItem } from '../types';

const sampleEskul: ExtracurricularItem[] = [
  {
    id: 'eskul-1',
    name: 'Pramuka MA Amanatulloh',
    category: 'Kepanduan',
    description: 'Gerakan Pramuka Gugus Depan MA Amanatulloh',
    schedule: 'Jumat, 14:00 - 16:30 WIB',
    location: 'Lapangan Utama',
    coach: 'Kak Ahmad S.Pd',
    image: '',
    achievements: ['Juara 1 Lomba Pionering 2024'],
    isActive: true,
    order: 1,
  },
  {
    id: 'eskul-2',
    name: 'Hadrah & Shalawat Al-Banjari',
    category: 'Keagamaan',
    description: 'Seni musik Islam hadrah Al-Banjari',
    schedule: 'Rabu, 15:00 - 17:00 WIB',
    location: 'Musholla Madrasah',
    coach: 'Ust. Ridwan',
    image: '',
    achievements: ['Juara Umum Festival Banjari se-Kabupaten'],
    isActive: true,
    order: 2,
  },
  {
    id: 'eskul-3',
    name: 'Futsal Club',
    category: 'Olahraga',
    description: 'Klub futsal pembinaan bakat olahraga',
    schedule: 'Sabtu, 07:30 - 10:00 WIB',
    location: 'Lapangan Futsal',
    coach: 'Coach Dimas',
    image: '',
    achievements: [],
    isActive: false, // Inactive should be hidden from public
    order: 3,
  },
];

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    extracurricular: sampleEskul,
    schoolIdentity: {
      schoolName: 'MA Amanatulloh',
      schoolShortName: 'MA Amanatulloh',
    },
  }),
}));

describe('Ekstrakurikuler Page', () => {
  it('hanya menampilkan ekstrakurikuler yang berstatus aktif', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    expect(screen.getByText('Pramuka MA Amanatulloh')).toBeInTheDocument();
    expect(screen.getByText('Hadrah & Shalawat Al-Banjari')).toBeInTheDocument();
    expect(screen.queryByText('Futsal Club')).not.toBeInTheDocument();
  });

  it('memfilter ekstrakurikuler berdasarkan kategori', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    // Click 'Keagamaan' tab button
    const keagamaanButtons = screen.getAllByRole('button', { name: /Keagamaan/i });
    fireEvent.click(keagamaanButtons[0]);

    expect(screen.getByText('Hadrah & Shalawat Al-Banjari')).toBeInTheDocument();
    expect(screen.queryByText('Pramuka MA Amanatulloh')).not.toBeInTheDocument();
  });

  it('memfilter ekstrakurikuler berdasarkan input pencarian', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Cari eskul/i);
    fireEvent.change(searchInput, { target: { value: 'Pramuka' } });

    expect(screen.getByText('Pramuka MA Amanatulloh')).toBeInTheDocument();
    expect(screen.queryByText('Hadrah & Shalawat Al-Banjari')).not.toBeInTheDocument();
  });

  it('membuka modal detail saat tombol detail diklik', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    const detailButtons = screen.getAllByText(/Lihat Detail Eskul/i);
    fireEvent.click(detailButtons[0]);

    // Check modal contents
    expect(screen.getByText('Jadwal:')).toBeInTheDocument();
    expect(screen.getByText('Lokasi:')).toBeInTheDocument();
    expect(screen.getByText('Pembina / Pelatih:')).toBeInTheDocument();
  });
});
