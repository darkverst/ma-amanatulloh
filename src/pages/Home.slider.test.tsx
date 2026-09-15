import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Home from './Home';
import { SliderItem } from '../types';

const mockSliderItems: SliderItem[] = [
  {
    id: 'slide-1',
    title: 'Slide Gambar dengan Opasitas Kustom 35%',
    subtitle: 'Subtitle Slide 1',
    image: 'https://example.com/slide1.jpg',
    backgroundColor: '#0f766e',
    buttonText: 'Pelajari Lebih Lanjut',
    buttonLink: '/profil',
    overlayOpacity: 35,
  },
  {
    id: 'slide-2',
    title: 'Slide Gambar Default Opasitas',
    subtitle: 'Subtitle Slide 2',
    image: 'https://example.com/slide2.jpg',
    backgroundColor: '#16a34a',
    buttonText: 'Daftar',
    buttonLink: '/kontak',
    // overlayOpacity undefined -> should default to 70% (0.7)
  },
];

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    news: [],
    agenda: [],
    sliderItems: mockSliderItems,
    extracurricular: [],
    sponsorsData: {
      showSection: false,
      sponsors: [],
    },
    profileData: {
      about: 'Tentang MA Amanatulloh',
      visi: 'Visi Sekolah',
      misi: [],
      sambutanKepsek: 'Sambutan',
      namaKepsek: 'Kepala Sekolah',
      jabatanKepsek: 'Kepala Madrasah',
      fotoKepsek: '',
    },
    statsData: {
      siswaAktif: '180+',
      tenagaPendidik: '18',
      prestasi: '50+',
      akreditasi: 'C',
    },
    instagramSettings: {
      enabled: false,
      posts: [],
    },
    schoolIdentity: {
      schoolName: 'MA Amanatulloh',
      schoolShortName: 'MA Amanatulloh',
      primaryColor: '#0f766e',
      secondaryColor: '#0f5aa6',
      accentColor: '#f59e0b',
      footerBackgroundColor: '#082f49',
    },
    trackEvent: vi.fn(),
  }),
}));

describe('Home Slider Overlay Transparency', () => {
  it('menerapkan opasitas overlay kustom pada slide gambar', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Slide 1 has overlayOpacity: 35
    const overlay1 = screen.getByTestId('slider-overlay-slide-1');
    expect(overlay1).toBeInTheDocument();
    expect(overlay1.style.opacity).toBe('0.35');

    // Slide 2 has undefined overlayOpacity -> defaults to 70% (0.7)
    const overlay2 = screen.getByTestId('slider-overlay-slide-2');
    expect(overlay2).toBeInTheDocument();
    expect(overlay2.style.opacity).toBe('0.7');
  });

  it('menampilkan judul dan tombol slide pertama', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Slide Gambar dengan Opasitas Kustom 35%')).toBeInTheDocument();
    expect(screen.getByText('Pelajari Lebih Lanjut')).toBeInTheDocument();
  });
});
