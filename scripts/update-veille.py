#!/usr/bin/env python3
"""
Script pour récupérer et mettre à jour les articles de veille technologique via RSS
Compatible avec GitHub Actions
"""

import json
import feedparser
import os
from datetime import datetime, timedelta
from pathlib import Path

def parse_rss_date(date_str):
    """Parse une date RSS et retourne un timestamp pour le tri"""
    try:
        # Essayer format RSS standard: "Mon, 30 Mar 2026 00:00:00 +0000"
        if ',' in date_str:
            date_obj = datetime.strptime(date_str[:16], '%a, %d %b %Y')
        else:
            # Essayer format ISO: "2026-04-07T08:17:39.159486"
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return date_obj.timestamp()
    except:
        return 0

def fetch_rss_articles(feeds_config, max_articles_per_feed=50):
    """Récupère les articles des flux RSS"""
    
    articles_by_category = {}
    all_articles = []
    
    for category in feeds_config['feeds']:
        category_name = category['name']
        category_icon = category['icon']
        tab_id = category.get('tab_id', category_name.lower().replace(' ', '-').replace('&', '').strip('-'))
        
        articles_by_category[tab_id] = {
            'icon': category_icon,
            'articles': []
        }
        
        for source in category['sources']:
            try:
                print(f"📥 Récupération de {source['title']}...")
                feed = feedparser.parse(source['url'])
                
                # Limiter le nombre d'articles par flux
                for entry in feed.entries[:max_articles_per_feed]:
                    article = {
                        'title': entry.get('title', 'Sans titre'),
                        'description': entry.get('summary', entry.get('description', 'Pas de description')),
                        'link': entry.get('link', '#'),
                        'source': source['title'],
                        'category': source['category'],
                        'published': entry.get('published', datetime.now().isoformat()),
                        'author': entry.get('author', 'Inconnu')
                    }
                    articles_by_category[tab_id]['articles'].append(article)
                    all_articles.append(article)
                    
                print(f"✅ {len(feed.entries[:max_articles_per_feed])} articles de {source['title']}")
                
            except Exception as e:
                print(f"⚠️ Erreur lors de la récupération de {source['title']}: {e}")
                continue
    
    # Trier les articles de chaque catégorie par date (plus récent d'abord)
    for tab_id, category_data in articles_by_category.items():
        if tab_id != 'recents' and 'articles' in category_data:
            category_data['articles'].sort(key=lambda x: parse_rss_date(x['published']), reverse=True)
    
    # Ajouter la section "recents" avec tous les articles triés par date (plus récent d'abord)
    sorted_articles = sorted(all_articles, key=lambda x: parse_rss_date(x['published']), reverse=True)
    articles_by_category['recents'] = {
        'icon': '📌',
        'articles': sorted_articles
    }
    
    return articles_by_category

def save_articles_json(articles, output_path='veille-articles.json'):
    """Sauvegarde les articles dans un fichier JSON"""
    
    output = {
        'lastUpdate': datetime.now().isoformat(),
        'articles': articles
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Fichier sauvegardé: {output_path}")

def main():
    """Fonction principale"""
    
    print("🚀 Démarrage de la mise à jour de la veille technologique...")
    print("=" * 60)
    
    # Chemin du fichier de configuration
    config_path = 'veille-rss-feeds.json'
    
    # Charger la configuration
    if not os.path.exists(config_path):
        print(f"❌ Fichier de configuration introuvable: {config_path}")
        return False
    
    with open(config_path, 'r', encoding='utf-8') as f:
        feeds_config = json.load(f)
    
    print(f"📋 Configuration chargée: {len(feeds_config['feeds'])} catégories")
    print("=" * 60)
    
    # Récupérer les articles
    articles = fetch_rss_articles(feeds_config)
    
    # Sauvegarder les articles
    save_articles_json(articles)
    
    print("=" * 60)
    print("✨ Mise à jour terminée avec succès!")
    print(f"Total d'articles récupérés: {sum(len(cat['articles']) for cat in articles.values())}")
    
    return True

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
