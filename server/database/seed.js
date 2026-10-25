const { getDb } = require('./schema');

async function isDatabaseSeeded(db = getDb()) {
  const hasHeroContent = await db.get("SELECT 1 FROM site_content WHERE content_key = 'hero_name'");
  const categories = await db.get('SELECT COUNT(*) AS count FROM skill_categories');
  return Boolean(hasHeroContent) || (categories && categories.count > 0);
}

/**
 * Populates the database with the original portfolio content.
 *
 * Non-destructive by default: if any site content already exists the seed is skipped,
 * so CMS edits are never overwritten.
 */
async function seedDatabase({ force = false } = {}) {
  const db = getDb();

  if (!force && (await isDatabaseSeeded(db))) {
    return { seeded: false, reason: 'Database already contains content; seed skipped (use --force to restore defaults).' };
  }

  // 1. Site Content
  const siteContent = [
    ['hero_greeting', 'Hero Greeting', "Hi, I'm", 'hero'],
    ['hero_name', 'Hero Name', 'Aarush', 'hero'],
    ['hero_terminal_badge', 'Terminal Badge Text', 'aarush@4aru5h.in // sec_core', 'hero'],
    ['hero_subtitle', 'Hero Subtitle', 'Cybersecurity, Pentesting & Software Engineering', 'hero'],
    ['hero_description', 'Hero Description', "Computer Engineering student at MPSTME, NMIMS (B.Tech Integrated '29) based in Mumbai, India. Focused on offensive & defensive cybersecurity, network packet analysis, DevSecOps pipelines, and building resilient software architectures.", 'hero'],
    ['hero_email', 'Email Address', 'iamaarushmohan@gmail.com', 'hero'],
    ['hero_status', 'Availability Status', 'Available for Projects / Internships', 'hero'],
    ['hero_profile_name', 'Profile Name', 'Aarush Sharma', 'hero'],
    ['hero_profile_status', 'Profile Status Line', "MPSTME NMIMS '29 // Mumbai, IN", 'hero'],
    ['skills_label', 'Skills Section Label', 'Technical Competencies', 'skills'],
    ['skills_title', 'Skills Section Title', 'Skills & Capabilities', 'skills'],
    ['skills_desc', 'Skills Section Description', 'Comprehensive toolsets across offensive/defensive cybersecurity, software engineering, and core systems.', 'skills'],
    ['experience_label', 'Experience Section Label', 'Career Journey', 'experience'],
    ['experience_title', 'Experience Section Title', 'Work Experience', 'experience'],
    ['certifications_label', 'Certifications Label', 'Verified Credentials', 'certifications'],
    ['certifications_title', 'Certifications Title', 'Certifications & Training', 'certifications'],
    ['certifications_desc', 'Certifications Description', 'Industry-recognized credentials in cybersecurity, ethical hacking, foundational CS, and agentic workflows.', 'certifications'],
    ['resume_label', 'Resume Section Label', 'Curriculum Vitae', 'resume'],
    ['resume_title', 'Resume Section Title', 'Resume Overview', 'resume'],
    ['resume_desc', 'Resume Section Description', 'Academic background, cybersecurity competencies, and developer leadership.', 'resume'],
    ['resume_name', 'Resume Name', 'Aarush Sharma', 'resume'],
    ['resume_tagline', 'Resume Tagline', 'Computer Engineering • Cybersecurity & DevSecOps', 'resume'],
    ['resume_education_title', 'Education Title', 'Mukesh Patel School of Technology Management & Engineering (MPSTME), NMIMS', 'resume'],
    ['resume_education_meta', 'Education Meta', "B.Tech Integrated in Computer Engineering // 2024 – 2029 (Mumbai, India)", 'resume'],
    ['resume_education_desc', 'Education Description', 'Specializing in Cybersecurity, Penetration Testing, Network Packet Analysis, DevSecOps pipelines, and Software Development.', 'resume'],
    ['resume_skills_security', 'Resume Security Skills', 'Wireshark, Nessus, Kali Linux, Penetration Testing, Network Analysis, DevSecOps, Vulnerability Audits, SSL/TLS, TCP/IP.', 'resume'],
    ['resume_skills_dev', 'Resume Development Skills', 'Python, Java, C/C++, Kotlin, PHP, JavaScript, React, Node.js, HTML5/CSS3, Bootstrap 5, REST APIs.', 'resume'],
    ['resume_skills_db', 'Resume Database Skills', 'MySQL, MongoDB, Linux/Unix Internals, Data Structures & Algorithms, Pinecone Vector DB, Godot Engine.', 'resume'],
    ['projects_label', 'Projects Section Label', 'Selected Work', 'projects'],
    ['projects_title', 'Projects Section Title', 'Projects', 'projects'],
    ['projects_desc', 'Projects Section Description', 'Tools, experiments, and builds across security and software engineering.', 'projects'],
    ['footer_brand', 'Footer Brand', 'Aarush Sharma / 4aru5h', 'footer'],
    ['footer_copy', 'Footer Copy', "Mumbai, India // MPSTME, NMIMS '29 // Cybersecurity & Engineering", 'footer'],
    ['footer_status', 'Footer Status', 'Security Core Active', 'footer'],
    ['nav_brand_name', 'Nav Brand Name', 'Aarush', 'navigation'],
    ['nav_brand_alt', 'Nav Brand Alt', '4aru5h', 'navigation']
  ];

  for (const item of siteContent) {
    await db.run('INSERT OR REPLACE INTO site_content (content_key, label, value, section) VALUES (?, ?, ?, ?)', item);
  }

  // 2. Skill Categories & Skills
  await db.run('DELETE FROM skills');
  await db.run('DELETE FROM skill_categories');

  const cat1 = await db.run('INSERT INTO skill_categories (name, icon_color, display_order) VALUES (?, ?, ?)', ['Cybersecurity & Tools', 'var(--accent-cyan)', 1]);
  const cat1Skills = ['Wireshark', 'Nessus', 'Kali Linux', 'Penetration Testing', 'Network Analysis', 'DevSecOps', 'Git', 'Bash CLI', 'MS Excel', 'Burp Suite'];
  for (let i = 0; i < cat1Skills.length; i++) {
    await db.run('INSERT INTO skills (category_id, name, display_order) VALUES (?, ?, ?)', [cat1.lastID, cat1Skills[i], i + 1]);
  }

  const cat2 = await db.run('INSERT INTO skill_categories (name, icon_color, display_order) VALUES (?, ?, ?)', ['Languages & Web', 'var(--accent-violet)', 2]);
  const cat2Skills = ['Python', 'Java', 'C / C++', 'Kotlin', 'PHP', 'JavaScript', 'React', 'Node.js', 'HTML / CSS', 'Bootstrap', 'REST APIs'];
  for (let i = 0; i < cat2Skills.length; i++) {
    await db.run('INSERT INTO skills (category_id, name, display_order) VALUES (?, ?, ?)', [cat2.lastID, cat2Skills[i], i + 1]);
  }

  const cat3 = await db.run('INSERT INTO skill_categories (name, icon_color, display_order) VALUES (?, ?, ?)', ['Databases & Core CS', 'var(--accent-green)', 3]);
  const cat3Skills = ['MySQL', 'MongoDB', 'Data Structures & Algorithms', 'Network Protocols (TCP/IP, DNS)', 'Linux Systems'];
  for (let i = 0; i < cat3Skills.length; i++) {
    await db.run('INSERT INTO skills (category_id, name, display_order) VALUES (?, ?, ?)', [cat3.lastID, cat3Skills[i], i + 1]);
  }

  const cat4 = await db.run('INSERT INTO skill_categories (name, icon_color, display_order) VALUES (?, ?, ?)', ['Domains & Methods', 'var(--accent-amber)', 4]);
  const cat4Skills = ['Vulnerability Assessment', 'UI/UX Prototyping', 'RAG & LangGraph', 'Pinecone Vector DB', 'Game QA & Godot'];
  for (let i = 0; i < cat4Skills.length; i++) {
    await db.run('INSERT INTO skills (category_id, name, display_order) VALUES (?, ?, ?)', [cat4.lastID, cat4Skills[i], i + 1]);
  }

  // 3. Certifications
  await db.run('DELETE FROM certifications');
  const certs = [
    ['Google Cybersecurity Professional', 'Google', 'Comprehensive foundation in network security, threat intelligence, SIEM tools, packet inspection, incident response, and Python automation.', 'Verified', 'var(--accent-cyan)'],
    ['Cybersecurity & Ethical Hacking', 'iHUB Divyasampark IIT Roorkee', 'Offensive security methodology, vulnerability assessment with Nessus, wireless auditing, Kali Linux toolsets, and hands-on penetration testing.', 'IIT Roorkee', 'var(--accent-violet)'],
    ['CS50x: Intro to Computer Science', 'Harvard University', 'Rigorous foundation in computer science principles, C, Python, algorithms, data structures, memory management, and software design.', 'Harvard', 'var(--accent-green)'],
    ['RAG Systems & Agentic Workflows', 'Board Infinity', 'Building autonomous agentic pipelines and Retrieval-Augmented Generation workflows using Pinecone vector databases and LangGraph.', 'AI Agentic', 'var(--accent-amber)']
  ];
  for (let i = 0; i < certs.length; i++) {
    await db.run('INSERT INTO certifications (title, issuer, description, badge_text, icon_color, display_order) VALUES (?, ?, ?, ?, ?, ?)', [...certs[i], i + 1]);
  }

  // 4. Experiences
  await db.run('DELETE FROM experiences');
  const experiences = [
    ['Executive', 'Google Developer Group on Campus (SVKM NMIMS MPSTME Mumbai)', 'Aug 2026 -- Present', 'Organizing developer initiatives, technical workshops, hackathons, and community tech events across MPSTME campus.', JSON.stringify(['Community Leadership', 'Technical Workshops', 'Developer Advocacy'])],
    ['Web Development Intern', 'Complete Cinema', 'May 2026 -- Jul 2026', 'Worked with WordPress and modern web frameworks to architect scalable website infrastructure and manage full-lifecycle front-end deployments.', JSON.stringify(['Web Development', 'Node.js', 'WordPress'])],
    ['Web Design & Development', 'ISA Tech MPSTME', 'Mar 2025 -- Sep 2025', 'Designed user-centered interfaces focusing on modern UI/UX principles and built front-end features for student events and organizational platforms.', JSON.stringify(['UI Design', 'UX Strategy', 'Frontend Architecture'])],
    ['Beta Tester & Contributor', 'Execelia Studios', 'Feb 2024', 'Beta-tested the horror-themed game Elhosea, highlighted critical bugs and runtime issues, tested edge-cases, and provided solutions using Godot to ensure optimal performance on Windows devices.', JSON.stringify(['Godot', 'Game QA', 'Edge-case Debugging', 'Windows Performance'])]
  ];
  for (let i = 0; i < experiences.length; i++) {
    await db.run('INSERT INTO experiences (role, company, date_range, description, tags, display_order) VALUES (?, ?, ?, ?, ?, ?)', [...experiences[i], i + 1]);
  }

  // 5. Navigation Items
  await db.run('DELETE FROM navigation_items');
  const navItems = [
    ['Skills', '#skills'],
    ['Experience', '#experience'],
    ['Certificates', '#certifications'],
    ['Resume', '#resume-view'],
    ['Blog', '/blog']
  ];
  for (let i = 0; i < navItems.length; i++) {
    await db.run('INSERT INTO navigation_items (label, href, display_order) VALUES (?, ?, ?)', [...navItems[i], i + 1]);
  }

  // 6. Sections
  const sections = [
    ['hero', 'Hero'],
    ['skills', 'Skills Matrix'],
    ['experience', 'Work Experience'],
    ['certifications', 'Certifications'],
    ['resume-view', 'Resume View'],
    ['blog', 'Blog'],
    ['projects', 'Projects']
  ];
  for (let i = 0; i < sections.length; i++) {
    await db.run('INSERT OR REPLACE INTO sections (section_key, label, display_order) VALUES (?, ?, ?)', [...sections[i], i + 1]);
  }

  // 7. Site Settings
  const settings = [
    ['site_name', 'Aarush Sharma | Cybersecurity & Software Engineer', 'text', 'Site Title'],
    ['site_description', 'Computer Engineering student at MPSTME, NMIMS specializing in Cybersecurity, Penetration Testing, and Software Engineering.', 'text', 'Site Meta Description'],
    ['contact_email', 'iamaarushmohan@gmail.com', 'text', 'Contact Email'],
    ['github_url', 'https://github.com/4aru5h', 'text', 'GitHub Profile URL'],
    ['linkedin_url', 'https://linkedin.com/in/4aru5h', 'text', 'LinkedIn Profile URL'],
    ['status_badge_text', 'Available for Internships & Projects', 'text', 'Status Badge Text'],
    ['status_badge_active', '1', 'boolean', 'Show Status Badge'],
    ['theme_accent', '#38bdf8', 'color', 'Primary Accent Color'],
    ['custom_css', '', 'code', 'Custom CSS Overrides']
  ];
  for (const s of settings) {
    await db.run('INSERT OR REPLACE INTO site_settings (setting_key, setting_value, setting_type, label) VALUES (?, ?, ?, ?)', s);
  }

  return { seeded: true };
}

module.exports = { seedDatabase, isDatabaseSeeded };
