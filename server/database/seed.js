const { getDb } = require('./schema');

function isDatabaseSeeded(db = getDb()) {
  // Migrations insert a few rows of their own, so detect the original seed content specifically.
  const hasHeroContent = db.prepare("SELECT 1 FROM site_content WHERE content_key = 'hero_name'").get();
  const hasCategories = db.prepare('SELECT COUNT(*) AS count FROM skill_categories').get().count > 0;
  return Boolean(hasHeroContent) || hasCategories;
}

/**
 * Populates the database with the original portfolio content.
 *
 * Non-destructive by default: if any site content already exists the seed is skipped,
 * so CMS edits are never overwritten. `force: true` restores the original content and
 * DELETES current skills, categories, certifications, experiences and navigation items —
 * callers must take a backup first (see database/init.js).
 *
 * @returns {{ seeded: boolean, reason?: string }}
 */
function seedDatabase({ force = false } = {}) {
  const db = getDb();

  if (!force && isDatabaseSeeded(db)) {
    return { seeded: false, reason: 'Database already contains content; seed skipped (use --force to restore defaults).' };
  }

  // Use a transaction for bulk inserts
  const transaction = db.transaction(() => {
    // 1. Site Content
    const insertSiteContent = db.prepare(`
      INSERT OR REPLACE INTO site_content (content_key, label, value, section)
      VALUES (?, ?, ?, ?)
    `);
    
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
      ['footer_brand', 'Footer Brand', 'Aarush Sharma / 4aru5h', 'footer'],
      ['footer_copy', 'Footer Copy', "Mumbai, India // MPSTME, NMIMS '29 // Cybersecurity & Engineering", 'footer'],
      ['footer_status', 'Footer Status', 'Security Core Active', 'footer'],
      ['nav_brand_name', 'Nav Brand Name', 'Aarush', 'navigation'],
      ['nav_brand_alt', 'Nav Brand Alt', '4aru5h', 'navigation']
    ];
    
    siteContent.forEach(item => insertSiteContent.run(...item));

    // 2. Skill Categories & Skills
    // We clear them first to avoid duplicates on re-run
    db.prepare('DELETE FROM skills').run();
    db.prepare('DELETE FROM skill_categories').run();

    const insertCategory = db.prepare(`
      INSERT INTO skill_categories (name, icon_color, display_order)
      VALUES (?, ?, ?)
    `);
    
    const insertSkill = db.prepare(`
      INSERT INTO skills (category_id, name, display_order)
      VALUES (?, ?, ?)
    `);

    // Category 1
    let result = insertCategory.run('Cybersecurity & Tools', 'var(--accent-cyan)', 1);
    const cat1Id = result.lastInsertRowid;
    const cat1Skills = ['Wireshark', 'Nessus', 'Kali Linux', 'Penetration Testing', 'Network Analysis', 'DevSecOps', 'Git', 'Bash CLI', 'MS Excel', 'Burp Suite'];
    cat1Skills.forEach((skill, i) => insertSkill.run(cat1Id, skill, i + 1));

    // Category 2
    result = insertCategory.run('Languages & Web', 'var(--accent-violet)', 2);
    const cat2Id = result.lastInsertRowid;
    const cat2Skills = ['Python', 'Java', 'C / C++', 'Kotlin', 'PHP', 'JavaScript', 'React', 'Node.js', 'HTML / CSS', 'Bootstrap', 'REST APIs'];
    cat2Skills.forEach((skill, i) => insertSkill.run(cat2Id, skill, i + 1));

    // Category 3
    result = insertCategory.run('Databases & Core CS', 'var(--accent-green)', 3);
    const cat3Id = result.lastInsertRowid;
    const cat3Skills = ['MySQL', 'MongoDB', 'Data Structures & Algorithms', 'Network Protocols (TCP/IP, DNS)', 'Linux Systems'];
    cat3Skills.forEach((skill, i) => insertSkill.run(cat3Id, skill, i + 1));

    // Category 4
    result = insertCategory.run('Domains & Methods', 'var(--accent-amber)', 4);
    const cat4Id = result.lastInsertRowid;
    const cat4Skills = ['Vulnerability Assessment', 'UI/UX Prototyping', 'RAG & LangGraph', 'Pinecone Vector DB', 'Game QA & Godot'];
    cat4Skills.forEach((skill, i) => insertSkill.run(cat4Id, skill, i + 1));

    // 3. Certifications
    db.prepare('DELETE FROM certifications').run();
    const insertCert = db.prepare(`
      INSERT INTO certifications (title, issuer, description, badge_text, icon_color, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const certifications = [
      ['Google Cybersecurity Professional', 'Google', 'Comprehensive foundation in network security, threat intelligence, SIEM tools, packet inspection, incident response, and Python automation.', 'Verified', 'var(--accent-cyan)'],
      ['Cybersecurity & Ethical Hacking', 'iHUB Divyasampark IIT Roorkee', 'Offensive security methodology, vulnerability assessment with Nessus, wireless auditing, Kali Linux toolsets, and hands-on penetration testing.', 'IIT Roorkee', 'var(--accent-violet)'],
      ['CS50x: Intro to Computer Science', 'Harvard University', 'Rigorous foundation in computer science principles, C, Python, algorithms, data structures, memory management, and software design.', 'Harvard', 'var(--accent-green)'],
      ['RAG Systems & Agentic Workflows', 'Board Infinity', 'Building autonomous agentic pipelines and Retrieval-Augmented Generation workflows using Pinecone vector databases and LangGraph.', 'AI Agentic', 'var(--accent-amber)']
    ];
    
    certifications.forEach((cert, i) => insertCert.run(cert[0], cert[1], cert[2], cert[3], cert[4], i + 1));

    // 4. Experiences
    db.prepare('DELETE FROM experiences').run();
    const insertExp = db.prepare(`
      INSERT INTO experiences (role, company, date_range, description, tags, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const experiences = [
      ['Executive', 'Google Developer Group on Campus (SVKM NMIMS MPSTME Mumbai)', 'Aug 2026 -- Present', 'Organizing developer initiatives, technical workshops, hackathons, and community tech events across MPSTME campus.', JSON.stringify(['Community Leadership', 'Technical Workshops', 'Developer Advocacy'])],
      ['Web Development Intern', 'Complete Cinema', 'May 2026 -- Jul 2026', 'Worked with WordPress and modern web frameworks to architect scalable website infrastructure and manage full-lifecycle front-end deployments.', JSON.stringify(['Web Development', 'Node.js', 'WordPress'])],
      ['Web Design & Development', 'ISA Tech MPSTME', 'Mar 2025 -- Sep 2025', 'Designed user-centered interfaces focusing on modern UI/UX principles and built front-end features for student events and organizational platforms.', JSON.stringify(['UI Design', 'UX Strategy', 'Frontend Architecture'])],
      ['Beta Tester & Contributor', 'Execelia Studios', 'Feb 2024', 'Beta-tested the horror-themed game Elhosea, highlighted critical bugs and runtime issues, tested edge-cases, and provided solutions using Godot to ensure optimal performance on Windows devices.', JSON.stringify(['Godot', 'Game QA', 'Edge-case Debugging', 'Windows Performance'])]
    ];
    
    experiences.forEach((exp, i) => insertExp.run(exp[0], exp[1], exp[2], exp[3], exp[4], i + 1));

    // 5. Navigation Items
    db.prepare('DELETE FROM navigation_items').run();
    const insertNav = db.prepare(`
      INSERT INTO navigation_items (label, href, display_order)
      VALUES (?, ?, ?)
    `);
    
    const navItems = [
      ['Skills', '#skills'],
      ['Experience', '#experience'],
      ['Certificates', '#certifications'],
      ['Resume', '#resume-view'],
      ['Blog', '/blog']
    ];
    
    navItems.forEach((nav, i) => insertNav.run(nav[0], nav[1], i + 1));

    // 6. Sections
    const insertSection = db.prepare(`
      INSERT OR REPLACE INTO sections (section_key, label, display_order)
      VALUES (?, ?, ?)
    `);
    
    const sections = [
      ['hero', 'Hero'],
      ['skills', 'Skills Matrix'],
      ['experience', 'Work Experience'],
      ['certifications', 'Certifications'],
      ['resume-view', 'Resume View'],
      ['blog', 'Blog']
    ];
    
    sections.forEach((sec, i) => insertSection.run(sec[0], sec[1], i + 1));

    // 7. Site Settings
    const insertSetting = db.prepare(`
      INSERT OR REPLACE INTO site_settings (setting_key, setting_value, label)
      VALUES (?, ?, ?)
    `);
    
    const settings = [
      ['site_title', 'Aarush Sharma | Cybersecurity & Software Engineer', 'Site Title'],
      ['site_description', 'Aarush Sharma (4aru5h) — Computer Engineering student at MPSTME, NMIMS focusing on Cybersecurity, Pentesting, Network Analysis, DevSecOps, and Software Development. Based in Mumbai, India.', 'Site Description'],
      ['github_url', 'https://github.com/4aru5h', 'GitHub URL'],
      ['linkedin_url', 'https://linkedin.com/in/4aru5h', 'LinkedIn URL'],
      ['email', 'iamaarushmohan@gmail.com', 'Contact Email'],
      ['resume_pdf_url', 'resume.pdf', 'Resume PDF URL'],
      ['profile_image_url', 'profile.jpg', 'Profile Image URL']
    ];
    
    settings.forEach(set => insertSetting.run(set[0], set[1], set[2]));
  });

  // The transaction rolls back automatically on error; let the caller report it.
  transaction();
  return { seeded: true };
}

module.exports = { seedDatabase, isDatabaseSeeded };
