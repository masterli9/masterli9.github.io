import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield } from 'lucide-react'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background-dark/95 backdrop-blur-xl z-[60] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto relative"
            >
              <button 
                onClick={onClose}
                className="cursor-pointer absolute top-6 right-6 z-30 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors flex items-center justify-center"
              >
                <X size={24} className="text-text-onLight" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                    <Shield size={28} className="text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-3xl text-text-onLight tracking-tighter">
                      Ochrana soukromí
                    </h2>
                    <p className="text-text-mutedOnLight text-sm">Poslední aktualizace: březen 2026</p>
                  </div>
                </div>

                <div className="w-12 h-1 bg-brand-blue mb-8"></div>

                <div className="space-y-8 text-text-mutedOnLight leading-relaxed">
                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      Jaké údaje shromažďuji
                    </h3>
                    <p>
                      Tato webová stránka je osobním portfoliem a neshromažďuje žádné osobní údaje automaticky. 
                      Pokud mě kontaktujete prostřednictvím kontaktního formuláře, zpracovávám pouze informace, 
                      které mi dobrovolně poskytnete – typicky jméno, e-mailovou adresu a obsah zprávy.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      Účel zpracování
                    </h3>
                    <p>
                      Vaše údaje z kontaktního formuláře používám výhradně k odpovědi na váš dotaz nebo 
                      nabídku spolupráce. Data nejsou využívána k marketingovým účelům ani sdílena s třetími stranami.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      Cookies a analytika
                    </h3>
                    <p>
                      Tato stránka nepoužívá sledovací cookies ani analytické nástroje třetích stran. 
                      Mohou být použity pouze technicky nezbytné cookies pro správné fungování webu.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      Uchovávání dat
                    </h3>
                    <p>
                      Zprávy z kontaktního formuláře uchovávám pouze po dobu nezbytnou k vyřízení 
                      vašeho požadavku. Po ukončení komunikace jsou data smazána.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      Vaše práva
                    </h3>
                    <p>
                      Máte právo požádat o přístup k vašim údajům, jejich opravu nebo výmaz. 
                      Pro jakékoliv dotazy ohledně ochrany osobních údajů mě kontaktujte na e-mailu 
                      uvedeném v kontaktní sekci.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      Zabezpečení
                    </h3>
                    <p>
                      Web je provozován s použitím HTTPS protokolu, který zajišťuje šifrovanou 
                      komunikaci mezi vaším prohlížečem a serverem.
                    </p>
                  </section>
                </div>

                <div className="mt-10 pt-8 border-t border-black/5">
                  <button
                    onClick={onClose}
                    className="cursor-pointer w-full px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-brand-blue transition-all"
                  >
                    Rozumím
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
