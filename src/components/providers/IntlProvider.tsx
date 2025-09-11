"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import nlMessages from "../../messages/nl.json";

interface IntlProviderProps {
  children: ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  const [locale, setLocale] = useState("nl");
  const [messages, setMessages] = useState<any>(nlMessages); // Start with Dutch as default
  const [isLoading, setIsLoading] = useState(false); // No loading needed initially

  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Get the preferred language from localStorage or default to 'nl'
        const preferredLanguage =
          localStorage.getItem("preferred-language") || "nl";

        // Only load if different from current locale
        if (preferredLanguage !== locale) {
          setLocale(preferredLanguage);

          // Load messages for the selected locale
          const messagesModule = await import(
            `../../messages/${preferredLanguage}.json`
          );
          setMessages(messagesModule.default);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        // Keep Dutch as fallback
        setLocale("nl");
        setMessages(nlMessages);
      }
    };

    loadMessages();
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
