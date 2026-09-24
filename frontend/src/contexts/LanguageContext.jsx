import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi')

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

// t(key, dict, lang) - translates a key using a { hi, en } dict
export function t(key, dict, lang) {
  if (!dict || !dict[lang]) return dict?.en?.[key] || key
  return dict[lang][key] || dict.en?.[key] || key
}
