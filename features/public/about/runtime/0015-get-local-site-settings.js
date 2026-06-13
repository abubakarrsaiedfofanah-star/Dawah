// Runtime slice from daawah.js: getLocalSiteSettings.
function getLocalSiteSettings() {
    const savedSettings = readStoredObject('siteSettings', {});
    const settings = {
        contact_location: 'UMMA University, Main Campus',
        contact_phone: '+23231422167',
        contact_email: 'info@dawah.org',
        contact_hours: 'Monday - Friday: 10 AM - 6 PM',
        about_title: 'About Us',
        about_heading: 'Who We Are',
        about_paragraph_1: "UMMA University Dawah Team is a community organization dedicated to serving Muslim students and staff at UMMA University. We are committed to fostering spiritual growth, academic excellence, and community support.",
        about_paragraph_2: 'Our association brings together students from various disciplines, creating a united platform for Islamic practice and mutual support.',
        about_feature_1: 'Supporting faith-based student life',
        about_feature_2: 'Organizing religious events and activities',
        about_feature_3: 'Providing welfare and counseling services',
        about_feature_4: 'Bridging academic excellence with Islamic values',
        what_we_do_title: 'What We Do',
        what_we_do_1_title: 'Spiritual Support',
        what_we_do_1_text: "Regular prayer gatherings, Jumu'ah services, and Islamic lectures to strengthen faith and spiritual growth among members.",
        what_we_do_2_title: 'Events & Activities',
        what_we_do_2_text: 'Organize seminars, workshops, social gatherings, and educational events that promote Islamic knowledge and community bonding.',
        what_we_do_3_title: 'Welfare Support',
        what_we_do_3_text: 'Provide financial assistance, counseling, and support services to members facing hardship or personal challenges.',
        what_we_do_4_title: 'Education',
        what_we_do_4_text: 'Offer resources for Islamic learning, including Quran study circles, Islamic history seminars, and knowledge-sharing sessions.',
        what_we_do_5_title: 'Community Service',
        what_we_do_5_text: 'Engage in volunteering and community outreach programs to benefit society and reflect Islamic values of compassion.',
        what_we_do_6_title: 'Leadership',
        what_we_do_6_text: 'Develop leadership skills and prepare members for roles in guiding and inspiring the Muslim student community.',
        social_whatsapp: 'https://api.whatsapp.com/send?phone=23231422167&text=Assalamu%20alaikum%2C%20I%20would%20like%20to%20contact%20Da%27awah%20Team.',
        social_facebook: '',
        social_x: '',
        social_instagram: '',
        social_youtube: '',
        social_tiktok: '',
        social_linkedin: '',
        ...savedSettings
    };
    settings.contact_email = normalizeContactEmail(settings.contact_email);
    return settings;
}
