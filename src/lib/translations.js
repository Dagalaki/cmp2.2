/**
 * The default set of translated pieces of text indexed by locale.
 * Values from window.__cmp.config.localization will override these
 * per locale.  Empty values will use the english value provided
 * inline in each component. Because the purpose definitions will change,
 * you will need to update the translations regularly. As a consequence, this
 * translations.js file is very important to keep up to date.
 */
export default {
	en: {
		intro: {
			title: 'Thanks for visiting',
			description: 'In order to run a successful website, we and certain third parties are setting cookies and accessing and storing information on your device for various purposes. Various third parties are also collecting data to show you personalized content and ads. Some third parties require your consent to collect data to serve you personalized content and ads.',
			showPurposes: 'Manage your choices',
			acceptAll: 'Got it, thanks!'
		},
		banner: {
			title: 'Ads help us run this site',
			description: 'When you visit our site, pre-selected companies may access and use certain information on your device and about this site to serve relevant ads or personalized content. If you click on "CONTINUE TO SITE", you accept this use. If you want to know more or personalize your choices, specifying which use you want to give consent to, click on the two other buttons. You will be able to change again your preferences by clicking on the link Cookie Preferences at the bottom of the page.',
			descriptionvendorlink: 'View pre-selected companies lists',
			links: {
				data: {
					title: 'Information that may be used',
					description: '<ul><li>Type of browser and its settings</li> <li>Information about the device\'s operating system</li> <li>Cookie information</li><li>Information about other identifiers assigned to the device</li> <li>The IP address from which the device accesses a client\'s website or mobile application</li> <li>Information about the user\'s activity on that device, including web pages and mobile apps visited or used </li> <li>Information about the geographic location of the device when it accesses a website or mobile application</li></ul>'
				},
				purposes: {
					title: 'Purposes for storing information',
					description: '',
					titleCustom: 'Other',
					titleGeneral: 'Third Party Vendors'
				},
				features: {
					title: 'Features',
					feature1: {
						name: 'Matching Data to Offline Sources',
						description: 'Combining data from offline sources that were initially collected in other contexts.'
					},
					feature2: {
						name: 'Linking Devices',
						description: 'Allow processing of a user\'s data to connect such user across multiple devices.'
					},
					feature3: {
						name: 'Precise Geographic Location Data',
						description: 'Allow processing of a user\'s precise geographic location data in support of a purpose for which that certain third party has consent.'
					}
				},
				manage: 'Manage Your Choices',
				accept: 'Continue to site',
				infoprivacy: 'Know More'
			}
		},
		summary: {
			title: 'Learn more about how information is being used?',
			description: 'We and select companies may access and use your information for the below purposes. You may customize your choices below or continue using our site if you\'re OK with the purposes.',
			detailLink: 'Learn More & Set Preferences',
			acceptAll: 'Accept All',
			denyAll: 'Deny All',
			who: {
				title: 'Who is using this information?',
				description: 'We and pre-selected companies will use your information. You can see each company in the links above or',
				link: 'see the complete list here'
			},
			what: {
				title: 'What information is being used?',
				description: 'Different companies use different information,',
				link: 'see the complete list here.'
			}
		},
		details: {
			back: 'Back',
			save: 'Continue Using Site'
		},
		purposes: {
			title: 'What information is being used?',
			description: 'Below is a complete list of the information that may be gathered.',
			back: 'Customize how this data is used from the previous page',
			items: '<ul><li>Type of browser and its settings</li><li>Information about the device\'s operating system</li><li>Cookie information</li><li>Information about other identifiers assigned to the device</li><li>The IP address from which the device accesses a client\'s website or mobile application</li><li>Information about the user\'s activity on that device, including web pages and mobile apps visited or used</li><li>Information about the geographic location of the device when it accesses a website or mobile application</li></ul>',
			optoutdDescription: `Depending on the type of data they collect, use,
						and process and other factors including privacy by design, certain partners rely on your consent while others require you to opt-out.
						For information on each vendor and to exercise your choices, see below.
						Or to opt-out, visit the <a href='http://optout.networkadvertising.org/?c=1#!/' target='_blank' style={{color: textLinkColor}}>NAI</a>
						, <a href='http://optout.aboutads.info/?c=2#!/' target='_blank' style={{color: textLinkColor}}>DAA</a>
						, or <a href='http://youronlinechoices.eu/' target='_blank' style={{color: textLinkColor}}>EDAA</a> sites.`,
			purpose1: {
				menu: '',
				title: '',
				description: ''
			},
			purpose2: {
				menu: '',
				title: '',
				description: ''
			},
			purpose3: {
				menu: '',
				title: '',
				description: ''
			},
			purpose4: {
				menu: '',
				title: '',
				description: ''
			},
			purpose5: {
				menu: '',
				title: '',
				description: ''
			}
		},
		features: {
			title: '',
			feature1: {
				name: 'Matching Data to Offline Sources',
				description: 'Combining data from offline sources that were initially collected in other contexts.'
			},
			feature2: {
				name: 'Linking Devices',
				description: 'Allow processing of a user\'s data to connect such user across multiple devices.'
			},
			feature3: {
				name: 'Precise Geographic Location Data',
				description: 'Allow processing of a user\'s precise geographic location data in support of a purpose for which that certain third party has consent.'
			}
		},
		vendors: {
			title: 'Who is using this information?',
			description: 'Here is the complete list of companies who will use your information. Please view their privacy policy for more details.',
			accept: 'Allow',
			acceptAll: '',
			acceptNone: '',
			optOut: '',
			back : 'Customize how these companies use data from the previous page',
			legint: 'Legitimate Interest',
			purposes: 'Purposes',
			features: 'Features'
		},
		Vlegint: 'Legitimate Interest',
		Vpurposes: 'Purposes',
		Vfeatures: 'Features'
	},
	it: {
		intro: {
			title: 'Grazie per aver visitato ',
			description: 'Su questo sito utilizziamo cookie tecnici e, previo tuo consenso, cookie di profilazione, nostri e di terze parti, per raccogliere informazioni statistiche e mostrarti pubblicità personalizzata attraverso l\'analisi della tua navigazione. ',
			showPurposes: 'Personalizza le tue scelte',
			acceptAll: 'Continua la navigazione'
		},
		banner: {
			title: 'Uso dei cookie',
			description: 'Su questo sito utilizziamo cookie tecnici e, previo tuo consenso, cookie di profilazione, nostri e di terze parti, per raccogliere informazioni statistiche e mostrarti pubblicità personalizzata attraverso l\'analisi della tua navigazione. Se clicchi su CONTINUA LA NAVIGAZIONE, accetti tale utilizzo. Se invece saperne di più o personalizzare le tue scelte prestando il consenso solo ad alcuni utilizzi, clicca su uno dei due pulsanti. <br />Se vorrai successivamente modificare le tue preferenze potrai falro cliccando sul link Preferenze Cookie nel footer della pagina.',
			descriptionvendorlink: 'Visualizza lista vendor di terze parti',
			links: {
				data: {
					title: 'Informazioni che possono essere utilizzate.',
					description: `<ul>
									<li>Tipo di browser e sua configurazione</li>
									<li>Informazioni sul sistema operativo del dispositivo</li>
									<li>Informazioni sui cookie</li>
									<li>Informazioni su altri identificatori assegnati al dispositivo</li>
									<li>Indirizzo IP da cui il dispositivo accede al sito Web o all'applicazione mobile</li>
									<li>Informazioni sull'attività dell'utente su questo dispositivo, comprese le pagine Web e le applicazioni mobile visitate o utilizzate</li>
									<li>Informazioni sulla posizione geografica del dispositivo quando si accede a un sito Web o un'applicazione mobile</li>
								</ul>`
				},
				purposes: {
					title: 'Uso dei dati.',
					description: `Come possono essere utilizzate le informazioni:`,
					titleCustom: 'Altri',
					titleGeneral: 'Terze Parti'
				},
				features: {
					title: 'In che modo sono usati i dati?',
					feature1: {
						name: 'Confronto dei dati off-line',
						description: 'La combinazione dei dati provenienti da fonti offline inizialmente raccolte in altri contesti con dati raccolti on-line a supporto di uno o più finalità.'
					},
					feature2: {
						name: 'Collegamento dei dispositivi',
						description: 'Trattamento dei dati per collegare più dispositivi appartenenti allo stesso utente a supporto di una o più finalità.'
					},
					feature3: {
						name: 'Precisione dei dati di ubicazione geografica',
						description: 'Raccolta e supporto di dati relativi all’ubicazione geografica specifici a sostegno di uno o più finalità.'
					}
				},
				manage: 'Personalizza le tue scelte',
				infoprivacy: 'Per saperne di più',
				accept: 'Continua la navigazione'
			}
		},
		details: {
			title: 'Impostazioni sulla privacy',
			back: 'Indietro',
			save: 'Salva ed esci'
		},
		summary: {
			title: 'Ulteriori informazioni su come vengono utilizzate le informazioni.',
			description: 'Noi e alcune società selezionate possiamo accedere e utilizzare le tue informazioni per i seguenti scopi. Puoi personalizzare le tue opzioni qui sotto o continuare a utilizzare il nostro sito se sei d\'accordo con gli scopi.',
			detailLink: 'Maggiori informazioni',
			acceptAll: 'Accetta Tutto',
			denyAll: 'Rifiuta Tutto',
			who:{
				title:'Chi sta usando queste informazioni?',
				description:'Noi e le società preselezionate utilizziamo le tue informazioni. Puoi vedere ciascuna compagnia nei link sopra.',
				link:'Guarda l\'elenco completo qui.'
			},
			what:{
				title:'Quali informazioni vengono utilizzate?',
				description:'Diverse aziende usano informazioni diverse,',
				link:'Guarda l\'elenco completo qui.'
			}
		},
        
		purposes: {
			title: 'Dati raccolti',
			description: 'Di seguito è riportato l\'elenco dei dati che possono essere raccolti:',
			back: 'Configura come vengono utilizzati questi dati',
			optoutdDescription: 'A seconda del tipo di dati che raccolgono, utilizzano e elaborano, e di altri fattori, inclusa la privacy in base alla progettazione, alcuni partner fanno affidamento sul loro consenso, mentre altri richiedono che vengano esclusi. Per informazioni su ciascun fornitore ed esercitare le tue scelte, vedi sotto. O per rinunciare, visitare i siti NAI, DAA o EDAA.',
			items: '<ul><li>Tipo e configurazione del browser</li><li>Informazioni sul sistema operativo</li><li>Dati dei cookie</li><li>Informazioni sul dispositivo utilizzato</li><li>L\'indirizzo IP da cui il dispositivo accede al sito Web</li><li>Informazioni sull\'attività dell\'utente su questo dispositivo, comprese le pagine Web visitate</li><li>Informazioni sulla posizione del dispositivo quando si accede al sito Web</li></ul>',
			purpose1: {
				menu: 'Archiviazione e accesso alle informazioni',
				title: 'Archiviazione e accesso alle informazioni',
				description: 'La memorizzazione e l\'accesso alle informazioni già memorizzate sul dispositivo, come identificatori pubblicitari, identificativi del dispositivo, cookie e tecnologie simili.'
			},
			purpose2: {
				menu: 'Personalizzazione',
				title: 'Personalizzazione',
				description: 'La raccolta e l\'elaborazione di informazioni per personalizzare successivamente la pubblicità e / o il contenuto per te, come in altri siti Web o applicazioni, nel tempo. Normalmente, la futura selezione di pubblicità e / o contenuti.'
			},
			purpose3: {
				menu: 'Selezione degli annunci, diffusione, report',
				title: 'Selezione degli annunci, diffusione, report',
				description: 'Consentire l\'elaborazione dei dati di un utente per fornire contenuti o annunci pubblicitari e misurare la diffusione di tali contenuti o pubblicità, estrarre informazioni e generare rapporti per comprendere l\'uso dei servizi; e / o accedere o memorizzare informazioni sui dispositivi per questo scopo. Includi le seguenti funzionalità.'

			},
			purpose4: {
				menu: 'Selezione dei contenuti, diffusione, report',
				title: 'Selezione dei contenuti, diffusione, report',
				description: 'Raccolta di informazioni e combinazione con informazioni precedentemente raccolte per selezionare e fornire contenuti per te e per misurare la consegna e l\'efficacia di tali contenuti. Ciò include l\'uso delle informazioni raccolte in precedenza sui tuoi interessi per selezionare il contenuto, elaborare i dati su quale contenuto è stato visualizzato, con quale frequenza o per quanto tempo è stato mostrato, quando e dove è stato visualizzato e se hai intrapreso qualche azione relativa al contenuto, incluso esempio, clic sul contenuto. Ciò non include la personalizzazione, che è la raccolta e l\'elaborazione di informazioni sull\'uso di questo servizio per personalizzare successivamente il contenuto e / o la pubblicità in altri contesti, come siti Web o applicazioni, nel tempo.'

			},
			purpose5: {
				menu: 'Misurazione',
				title: 'Misurazione',
				description: 'Raccolta di informazioni sull\'utilizzo del contenuto e sulla combinazione di informazioni raccolte in precedenza, utilizzate per misurare, comprendere e riferire sull\'utilizzo del servizio. Ciò non include la personalizzazione, la raccolta di informazioni sull\'uso di questo servizio per personalizzare successivamente il contenuto e / o la pubblicità in altri contesti, ovvero in altri servizi, come siti Web o applicazioni, nel tempo.'

			},
		},
		features: {
			feature1: {
				name: 'Confronto dei dati off-line',
				description: 'La combinazione dei dati provenienti da fonti offline inizialmente raccolte in altri contesti con dati raccolti on-line a supporto di uno o più finalità.'
			},
			feature2: {
				name: 'Collegamento dei dispositivi',
				description: 'Trattamento dei dati per collegare più dispositivi appartenenti allo stesso utente a supporto di una o più finalità.'
			},
			feature3: {
				name: 'Precisione dei dati di ubicazione geografica',
				description: 'Raccolta e supporto di dati relativi all’ubicazione geografica specifici a sostegno di uno o più finalità.'
			}
		},
		vendors: {
			title: 'I nostri partner',
			description: 'Aiutaci ad offrirti un servizio migliore. I nostri partner utilizzano i loro cookie del browser per comprendere, attraverso il web, i loro interessi e offrire contenuti e pubblicità pertinenti.',
			accept: 'Accetta',
			acceptAll: 'Accetta tutto',
			acceptNone: 'Rifiuta tutto',
			optOut: 'Richiede la rinuncia',
			back : 'Indietro',
			legint: 'Interesse Legittimo',
			purposes: 'Finalità',
			features: 'Caratteristiche'
		},
		Vlegint: 'Interesse Legittimo',
		Vpurposes: 'Finalità',
		Vfeatures: 'Caratteristiche'
	}
};
