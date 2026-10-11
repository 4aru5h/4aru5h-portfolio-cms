import React, { useState, useEffect } from 'react';
import api from '../api';

import IntroOverlay from '../components/IntroOverlay';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import SkillsSection from '../components/SkillsSection';
import ExperienceSection from '../components/ExperienceSection';
import CertificationsSection from '../components/CertificationsSection';
import ProjectsSection from '../components/ProjectsSection';
import ResumeSection from '../components/ResumeSection';
import Footer from '../components/Footer';
import CommandPalette from '../components/CommandPalette';
import Toast from '../components/Toast';

import '../styles/portfolio.css';

export default function Portfolio() {
  const [content, setContent] = useState({});
  const [settings, setSettings] = useState({});
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [sections, setSections] = useState({});
  const [cmdOpen, setCmdOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', desc: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const results = await Promise.allSettled([
          api.get('/content'),
          api.get('/skills'),
          api.get('/categories'),
          api.get('/experiences'),
          api.get('/certifications'),
          api.get('/projects'),
          api.get('/navigation'),
          api.get('/settings'),
          api.get('/sections'),
        ]);

        const [
          contentResult,
          skillsResult,
          categoriesResult,
          expResult,
          certResult,
          projResult,
          navResult,
          settingsResult,
          sectionsResult
        ] = results;

        if (contentResult.status === 'fulfilled' && contentResult.value?.data?.dictionary) {
          setContent(contentResult.value.data.dictionary);
        }
        if (skillsResult.status === 'fulfilled' && skillsResult.value?.data) {
          setSkills(skillsResult.value.data);
        }
        if (categoriesResult.status === 'fulfilled' && categoriesResult.value?.data) {
          setCategories(categoriesResult.value.data);
        }
        if (expResult.status === 'fulfilled' && expResult.value?.data) {
          setExperiences(expResult.value.data);
        }
        if (certResult.status === 'fulfilled' && certResult.value?.data) {
          setCertifications(certResult.value.data);
        }
        if (projResult.status === 'fulfilled' && projResult.value?.data) {
          setProjects(projResult.value.data);
        }
        if (navResult.status === 'fulfilled' && navResult.value?.data) {
          setNavItems(navResult.value.data);
        }
        if (settingsResult.status === 'fulfilled' && settingsResult.value?.dictionary) {
          setSettings(settingsResult.value.dictionary);
        }
        if (sectionsResult.status === 'fulfilled' && sectionsResult.value?.data) {
          const secMap = {};
          sectionsResult.value.data.forEach(s => {
            secMap[s.section_key] = s.is_visible === 1;
          });
          setSections(secMap);
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
      }
    }
    loadData();
  }, []);

  function handleCopyEmail(text) {
    const emailToCopy = text || settings.email || content.hero_email || 'iamaarushmohan@gmail.com';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emailToCopy).catch(() => {});
    }
    setToast({ show: true, title: 'Copied to clipboard!', desc: emailToCopy });
    setTimeout(() => {
      setToast({ show: false, title: '', desc: '' });
    }, 2800);
  }

  // Helper to check section visibility (default to true if not configured)
  const isSectionVisible = (key) => sections[key] !== false;

  return (
    <>
      <IntroOverlay />
      <Header
        onOpenCmdPalette={() => setCmdOpen(true)}
        content={content}
        navItems={navItems}
      />
      
      <main>
        {isSectionVisible('hero') && (
          <HeroSection
            content={content}
            settings={settings}
            onCopyEmail={handleCopyEmail}
          />
        )}

        {isSectionVisible('skills') && (
          <SkillsSection
            skills={skills}
            categories={categories}
            content={content}
          />
        )}

        {isSectionVisible('experience') && (
          <ExperienceSection
            experiences={experiences}
            content={content}
          />
        )}

        {isSectionVisible('certifications') && (
          <CertificationsSection
            certifications={certifications}
            content={content}
          />
        )}

        {isSectionVisible('projects') && (
          <ProjectsSection
            projects={projects}
            content={content}
          />
        )}

        {isSectionVisible('resume-view') && (
          <ResumeSection
            content={content}
            settings={settings}
            onCopyEmail={handleCopyEmail}
          />
        )}
      </main>

      <Footer
        content={content}
        settings={settings}
        onCopyEmail={handleCopyEmail}
      />

      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onCopyEmail={handleCopyEmail}
        settings={settings}
      />

      <Toast show={toast.show} title={toast.title} desc={toast.desc} />
    </>
  );
}
