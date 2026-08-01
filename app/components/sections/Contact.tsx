import { Clock, Globe2, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useI18n } from '../../contexts/i18nContext';
import { EditableText } from '../admin/EditableText';
import { SectionHeader } from '../animations';

interface ContactProps {
  isVisible: boolean;
}

export const Contact: React.FC<ContactProps> = React.memo(({ isVisible }) => {
  const { t, language } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '' // honeypot: kept off-screen, real visitors never fill it in
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');
    
    try {
      const response = await fetch(`/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitStatus('success');
        setSubmitMessage(t('contact.form.success'));
        setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setSubmitMessage(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Social links moved to navbar (mobile) and floating sidebar (desktop)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        isVisible={isVisible}
        title={<EditableText path="contact.title" locale={language} hoverGlow glowColor={[201, 60, 183]} liftOnHover={false}>{t('contact.title')}</EditableText>}
        subtitle={<EditableText path="contact.subtitle" locale={language} multiline>{t('contact.subtitle')}</EditableText>}
      />

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00bfe6]/20 to-[#0096c7]/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center gap-3 mb-8"
            >
              <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.4 }} className="shrink-0 flex items-center">
                <MessageSquare size={26} className="text-[#0096c7]" strokeWidth={2} />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800">
                {t('contact.form.title')}
              </h3>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot: real visitors never see or fill this, so anything landing here marks
                  the submission as a bot and the API silently drops it. */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfe6]/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfe6]/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.subject')}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfe6]/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder={t('contact.form.subjectPlaceholder')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={5000}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfe6]/50 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none"
                  placeholder={t('contact.form.messagePlaceholder')}
                />
              </motion.div>

              {/* Status Message */}
              {submitStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl text-center font-medium ${
                    submitStatus === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {submitMessage}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                whileHover={{ scale: isSubmitting ? 1 : 1.05, transition: { duration: 0.2, ease: 'easeOut' } }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95, transition: { duration: 0.1 } }}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] text-white font-bold rounded-xl hover:from-[#0096c7] hover:to-[#0077b6] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <Send size={20} />
                )}
                {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Direct contact + availability info (LinkedIn/GitHub live in the floating sidebar, not repeated here) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/20 to-[#00bfe6]/20 rounded-3xl blur-xl" />
          <div className="relative bg-white/25 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/30 shadow-2xl space-y-10">
            {/* Direct contact: sized as a standalone CTA (larger icon/padding/text) now that
                email is the only direct method here — it needs to carry the block on its own
                rather than read like one row from a list that lost its neighbor. */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('contact.direct.title')}</h4>
              <a
                href={`mailto:${t('contact.direct.email')}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/40 border border-white/40 hover:bg-white/60 transition-colors duration-300 ease-out group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00bfe6] to-[#0096c7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ease-out">
                  <Mail size={22} className="text-white" />
                </div>
                <span className="text-gray-800 font-medium text-lg truncate">
                  <EditableText path="contact.direct.email" locale={language}>{t('contact.direct.email')}</EditableText>
                </span>
              </a>
            </div>

            {/* Info: stacked (label above value) on narrow screens, side-by-side from sm: up.
                The old single-row `items-center` + `ml-auto` layout had no width constraint on
                the value, so it couldn't shrink or wrap — a long value (e.g. three languages)
                just overflowed the card instead. Stacking on mobile gives the value the full
                row width to wrap into naturally. */}
            <div className="space-y-3 pt-5 border-t border-white/30">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                  <MapPin size={18} className="text-[#00bfe6] shrink-0" />
                  {t('contact.info.location')}
                </span>
                <span className="text-sm text-gray-800 font-medium sm:ml-auto sm:text-right">
                  <EditableText path="contact.info.locationValue" locale={language}>{t('contact.info.locationValue')}</EditableText>
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                  <Globe2 size={18} className="text-[#00bfe6] shrink-0" />
                  {t('contact.info.phone')}
                </span>
                <span className="text-sm text-gray-800 font-medium sm:ml-auto sm:text-right">
                  <EditableText path="contact.info.phoneValue" locale={language}>{t('contact.info.phoneValue')}</EditableText>
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                  <Clock size={18} className="text-[#00bfe6] shrink-0" />
                  {t('contact.info.availability')}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-800 font-medium sm:ml-auto sm:text-right">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-green-500 shrink-0"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <EditableText path="contact.info.availabilityValue" locale={language}>{t('contact.info.availabilityValue')}</EditableText>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

Contact.displayName = 'Contact';
