
Introduction

The Philippines is in the grip of a persistent fuel crisis, with weekly price fluctuations that heavily burden the daily lives of ordinary workers (manggagawa), public transport drivers, and delivery riders. Every peso increase per liter directly cuts into their already tight take-home pay. While fuel prices are publicly displayed at stations, there is no real-time, easily accessible, and location-based tool that allows drivers to instantly find the cheapest fuel near them. GasUp365 aims to fill this gap by combining the power of community participation, image recognition, and map-based navigation to empower every Filipino motorist.

Problem Statement

Drivers currently rely on word-of-mouth, sporadic social media posts, or physically driving around to compare fuel prices. It is a wasteful and inefficient process that burns both fuel and money. There is no centralized, up-to-the-minute system that gives them the following at a glance:

The exact prices of unleaded, regular, diesel, and premium gasoline at nearby stations.
Which station offers the most cost-effective option for their specific fuel type.
Directions to that station integrated seamlessly into their daily route.

This lack of information forces many manggagawa and drivers to pay more than necessary, deepening the impact of the fuel crisis on their livelihoods.

Proposed Solution

A mobile application connected to a centralized cloud server. The app harnesses the collective effort of users through a snap-to-share mechanic:

Capture: A user at any gas station simply takes a photo of the station’s price board.
Extract: The app automatically grabs the location via GPS. The image is processed using on-device OCR (Optical Character Recognition) and a light NLP (Natural Language Processing) layer to accurately identify and extract prices for unleaded, regular, diesel, and other derivative fuels, matching them to their labels.
Centralize: The verified price, fuel type, station name (derived from location or user input), and timestamp are uploaded to the server.
Analyze & Navigate: Any user can open the map view, filter by fuel type, and instantly see a list or map of surrounding stations. With a single tap, they get Google Maps directions to the most cost-effective station, saving both money and unnecessary driving.

Target Audience

Primary: Jeepney, tricycle, and bus drivers (manggagawa sa transportasyon) whose profit margins are extremely sensitive to fuel prices.
Secondary: Delivery riders (food, parcels), taxi and TNVS (Grab) drivers, and private car owners who commute daily.
Tertiary: Everyday motorists looking to stretch their fuel budget, fleet managers, and even local government units monitoring fuel price trends in their area.

Unique Selling Proposition (USP)

GasUp365 is a live, self-updating map of fuel prices powered by the community. Unlike static government databases or delayed energy department reports, our data is fresh, verified by user photos, and intelligently sorted by proximity and cost-efficiency (which we call the cost-effective route). The “snap-to-save” loop makes contributing effortless, turning every driver into both a data provider and a beneficiary. The app directly answers the driver’s most urgent question: “Saan ako magpapagasolina na pinakamalapit at pinakamura ngayon?”

Key Features

Photo-to-Price OCR + NLP: Smart extraction of fuel type labels (Unleaded, Diesel, Regular, Premium, Kerosene) and their corresponding prices from any angle, with manual correction allowed before submission.
Live Price Map & List: Color-coded station pins showing price ranges, with a tap to see all fuel types and how long ago the price was updated.
Cost-Efficiency Sorter: Filter by fuel type and sort by “cheapest first” within a user-defined radius (1 km, 5 km, 10 km) and location, calculating savings versus the average price in the area.
One-Tap Navigate: Direct integration with Google Maps for instant turn-by-turn directions to the chosen station.
Community Trust System: Users can upvote a price as “still accurate” or report it as outdated; expired entries are automatically dimmed after a set time. Contributors earn trust points and badges.
Price Drop Alerts: Optional notification when a tracked fuel type drops below a user’s set budget threshold in their frequent areas.
Fuel National Pricing Average - Dashboard containing the current prices of regular, premium, diesel
Offline-Fallback Mode: Last-synced prices cached locally so users can browse even on poor data connections, syncing when back online.

Benefits and Impact

Direct Financial Savings: A driver who saves just ₱2–₱5 per liter by choosing a cheaper station a few blocks away can save hundreds of pesos monthly, money that can go back to their family’s food, education, or emergency funds.
Reduced Fuel Waste: Less circling around to compare prices means lower fuel consumption and less traffic congestion.
Empowered Workforce: The manggagawa gain a tool that gives them agency over a major operating cost, helping them plan routes more economically.
Transparency: Price discrepancies between neighboring stations become visible, encouraging fair competition and benefiting all consumers.
Data for Policy: Aggregated, anonymized data could aid local governments or DOE in monitoring regional price trends and compliance.

Feasibility and Implementation

The technology stack is built on mature, accessible components:

OCR & NLP: Google ML Kit’s Text Recognition (on-device) for reading price boards, combined with a thin regular-expression and keyword-matching layer to parse fuel names (e.g., “Diesel”, “Unleaded”) and corresponding numeric prices.
Backend & Database: Firebase (Firestore) for real-time data sync, user authentication, and serverless functions for price aggregation and stale data cleanup.
Mobile App: Cross-platform framework like Flutter for simultaneous iOS and Android release, ensuring wide reach for the Philippine market where Android dominates.
Maps Integration: Google Maps SDK for displaying stations, and the Directions API for navigation.
Phased Rollout:
Phase 1 (MVP): Aklan pilot. Core snap-and-share, manual correction, map view, and navigation.
Phase 2: Automated OCR, trust system, alerts, and nationwide expansion.
Phase 3: Fleet management dashboards, gas station partnership for official prices, and API access for third-party apps.
Sustainability: Freemium model with ad-free premium tier; location-based advertisements from non-fuel automotive businesses (lubricants, car wash, tire shops); possible government/NGO grants given the project’s public service angle.

Market Relevance

The transport sector and private motorists in the Philippines number in the millions. Fuel prices consistently rank as a top concern in consumer surveys, and every price hike sparks viral social media discussions. Existing solutions are fragmented, with Facebook groups, vibe-check texts from friends, or expensive proprietary fleet systems. GasUp365 enters a wide-open space: a consumer-friendly, map-centric, real-time fuel finder that directly addresses the top-of-mind pain point in a market where even a small permanent saving is deeply meaningful. With the push for digitalization and financial inclusion, a tool that puts cash back into the pockets of ordinary workers is both timely and essential.

Your Call To Action

We invite developers, transport cooperatives, local government units, and impact investors to collaborate in bringing GasUp365 to life. For drivers and manggagawa, be among the first to test the beta, where your snaps can help build the database that helps the whole community. Let’s not let the fuel crisis dictate our routes. Sama-sama tayong magtipid!, isang litro bawat pagkakataon. Download, snap, save.

Conclusion

GasUp365 turns every Filipino driver’s smartphone into a tool for collective savings. By simply taking a photo at a gas station, users contribute to a nationwide network of real-time fuel prices, making the choice of where to fill up smarter, faster, and kinder to their wallets. It’s a practical, scalable solution born directly from the daily struggle of the Filipino manggagawa, and with the right support, it can become an indispensable part of every journey.


Smart Based Navigation - Gives the route that is cheapest and most convenient based on smart based navigation with live price & map

