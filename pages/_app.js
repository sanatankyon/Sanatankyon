import Script from 'next/script'
import Header from '../components/Header'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement(
              { pageLanguage: 'en', autoDisplay: false },
              'google_translate_element'
            );
          }
        `}
      </Script>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Header />
      <Component {...pageProps} />
    </>
  )
}
