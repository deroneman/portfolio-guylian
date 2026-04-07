/**
 * API Handler pour envoyer les emails via BREVO
 * À déployer sur Vercel
 */

export default async function handler(req, res) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { name, email, subject, message } = req.body;

  // Valider les données
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  // Récupérer la clé API BREVO depuis les variables d'environnement
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
  if (!BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY non configurée');
    return res.status(500).json({ error: 'Erreur serveur : clé API non configurée' });
  }

  try {
    // Préparer le payload pour l'API BREVO
    const emailPayload = {
      sender: {
        name: 'Portfolio Guylian',
        email: 'noreply@portfolio-guylian.fr'
      },
      to: [
        {
          email: 'guylian.dupuy@hotmail.fr',
          name: 'Guylian Dupuy'
        }
      ],
      replyTo: {
        email: email,
        name: name
      },
      subject: `[PORTFOLIO] ${subject}`,
      htmlContent: `
        <h2>📧 Nouveau message depuis votre portfolio</h2>
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p style="font-size: 12px; color: #888;">
          Message reçu depuis: <a href="https://deroneman.github.io/portfolio-guylian/">https://deroneman.github.io/portfolio-guylian/</a>
        </p>
      `
    };

    // Envoyer via l'API BREVO
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(emailPayload)
    });

    const data = await response.json();

    // Vérifier la réponse
    if (!response.ok) {
      console.error('❌ Erreur BREVO:', data);
      return res.status(response.status).json({
        error: 'Erreur lors de l\'envoi de l\'email',
        details: data.message || 'Erreur inconnue'
      });
    }

    console.log('✅ Email envoyé avec succès:', data.messageId);

    return res.status(200).json({
      success: true,
      message: '✅ Message envoyé avec succès !',
      messageId: data.messageId
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de l\'envoi',
      message: error.message
    });
  }
}
