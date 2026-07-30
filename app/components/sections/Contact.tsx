import { Clock, Globe2, Mail, MapPin, MessageSquare, Phone, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useI18n } from '../../contexts/i18nContext';
import { EditableText } from '../admin/EditableText';

interface ContactProps {
  isVisible: boolean;
}

export const Contact: React.FC<ContactProps> = React.memo(({ isVisible }) => {
  const { t, language } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
        setFormData({ name: '', email: '', subject: '', message: '' });
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
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6"
        >
          {t('contact.title')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          {t('contact.subtitle')}
        </motion.p>
      </motion.div>

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
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="w-12 h-12 bg-gradient-to-r from-[#00bfe6] to-[#0096c7] rounded-xl flex items-center justify-center"
              >
                <MessageSquare size={24} className="text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800">
                {t('contact.form.title')}
              </h3>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="relative bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl space-y-8">
            {/* CTA */}
            <div>
              <div className="flex items-center gap-2 text-[#0096c7] font-semibold mb-2">
                <Sparkles size={18} />
                <span className="text-sm uppercase tracking-wide">{t('contact.cta.title')}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{t('contact.cta.subtitle')}</p>
            </div>

            {/* Direct contact */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('contact.direct.title')}</h4>
              <a
                href={`mailto:${t('contact.direct.email')}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/40 hover:bg-white/60 transition-colors duration-300 ease-out group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00bfe6] to-[#0096c7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ease-out">
                  <Mail size={18} className="text-white" />
                </div>
                <span className="text-gray-800 font-medium truncate">
                  <EditableText path="contact.direct.email" locale={language}>{t('contact.direct.email')}</EditableText>
                </span>
              </a>
              <a
                href={`tel:${t('contact.direct.phone').replace(/[\s-]+/g, '')}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/40 hover:bg-white/60 transition-colors duration-300 ease-out group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ease-out">
                  <Phone size={18} className="text-white" />
                </div>
                <span className="text-gray-800 font-medium">
                  <EditableText path="contact.direct.phone" locale={language}>{t('contact.direct.phone')}</EditableText>
                </span>
              </a>
            </div>

            {/* Info */}
            <div className="space-y-3 pt-2 border-t border-white/30">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#00bfe6] shrink-0" />
                <span className="text-sm text-gray-500">{t('contact.info.location')}</span>
                <span className="text-sm text-gray-800 font-medium ml-auto">
                  <EditableText path="contact.info.locationValue" locale={language}>{t('contact.info.locationValue')}</EditableText>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Globe2 size={18} className="text-[#00bfe6] shrink-0" />
                <span className="text-sm text-gray-500">{t('contact.info.phone')}</span>
                <span className="text-sm text-gray-800 font-medium ml-auto text-right">
                  <EditableText path="contact.info.phoneValue" locale={language}>{t('contact.info.phoneValue')}</EditableText>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#00bfe6] shrink-0" />
                <span className="text-sm text-gray-500">{t('contact.info.availability')}</span>
                <span className="flex items-center gap-1.5 text-sm text-gray-800 font-medium ml-auto">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-green-500"
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
