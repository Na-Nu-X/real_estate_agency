"""
Idempotent demo data seeder.

    python manage.py seed_data            # create / refresh demo agents and listings
    python manage.py seed_data --no-admin # skip creating the demo superuser

Running it repeatedly updates the same records (matched by agent e-mail and
property slug) instead of duplicating them.
"""

from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from properties.models import Agent, Property, PropertyImage

U = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=1600&q=80"
P = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=600&h=750&q=80&crop=faces"

DEMO_ADMIN_USERNAME = "admin"
DEMO_ADMIN_PASSWORD = "Reality2024!"

AGENTS = [
    {
        "email": "martin.kovac@reality-example.sk",
        "full_name": "Martin Kováč",
        "role": "Konateľ a senior maklér",
        "phone": "+421 905 123 456",
        "photo_url": P.format("1560250097-0b93528c311a"),
        "bio": "Viac ako 15 rokov sa venuje predaju prémiových nehnuteľností v Bratislave. "
               "Špecializuje sa na historické centrum, vily na Kolibe a diskrétne off-market transakcie.",
        "display_order": 1,
    },
    {
        "email": "zuzana.horvathova@reality-example.sk",
        "full_name": "Zuzana Horváthová",
        "role": "Senior maklérka – rezidenčné nehnuteľnosti",
        "phone": "+421 907 234 567",
        "photo_url": P.format("1573496359142-b8d87734a5a2"),
        "bio": "Architektka s citom pre detail. Pomáha rodinám nájsť domov, ktorý zodpovedá ich životnému štýlu, "
               "a predávajúcim pripraví nehnuteľnosť tak, aby zaujala už na prvej fotografii.",
        "display_order": 2,
    },
    {
        "email": "peter.novak@reality-example.sk",
        "full_name": "Peter Novák",
        "role": "Maklér – Košice a východné Slovensko",
        "phone": "+421 911 345 678",
        "photo_url": P.format("1507003211169-0a1dd7228f2d"),
        "bio": "Rodený Košičan, ktorý pozná každú ulicu Starého Mesta aj nové developerské projekty. "
               "Je odborníkom na investičné byty a komerčné priestory.",
        "display_order": 3,
    },
    {
        "email": "lucia.vargova@reality-example.sk",
        "full_name": "Lucia Vargová",
        "role": "Maklérka – Žilina a Vysoké Tatry",
        "phone": "+421 915 456 789",
        "photo_url": P.format("1580489944761-15a19d654956"),
        "bio": "Špecialistka na horské rezidencie, chaty a apartmány v Tatrách. "
               "Klientom pomáha aj s krátkodobým prenájmom a správou rekreačných nehnuteľností.",
        "display_order": 4,
    },
]

PROPERTIES = [
    {
        "slug": "penthouse-s-vyhladom-na-bratislavsky-hrad",
        "title": "Penthouse s výhľadom na Bratislavský hrad",
        "transaction": "predaj", "property_type": "byt",
        "price": "1290000", "city": "Bratislava", "district": "Staré Mesto, Panenská ulica",
        "floor_area": "186", "land_area": None, "rooms": 4, "floor": 7,
        "condition": "novostavba", "energy_class": "A",
        "badge": "exkluzivne", "is_featured": True, "agent": 0,
        "amenities": ["Terasa", "Výťah", "Garáž", "Klimatizácia", "Podlahové kúrenie", "Pivnica", "Recepcia"],
        "description": (
            "Výnimočný penthouse na poslednom podlaží zrekonštruovaného meštianskeho domu v srdci Starého Mesta. "
            "Dominantou je obývacia hala so stropmi vo výške 3,4 m a panoramatická terasa s výmerou 64 m², "
            "z ktorej sa otvára nerušený výhľad na Bratislavský hrad a Dóm sv. Martina.\n\n"
            "Interiér navrhlo renomované architektonické štúdio – dubové parkety rybia kosť, kuchyňa Bulthaup "
            "s ostrovom z prírodného kameňa, master suite so šatníkom a kúpeľňou s voľne stojacou vaňou. "
            "Súčasťou predaja sú dve garážové státia a pivnica.\n\n"
            "Ideálne pre klienta, ktorý hľadá reprezentatívne bývanie v pešej dostupnosti Hviezdoslavovho námestia, "
            "Eurovea a najlepších reštaurácií mesta."
        ),
        "cover": "1600607687939-ce8a6c25118c",
        "gallery": [
            ("1600607687939-ce8a6c25118c", "Obývacia hala"),
            ("1600566753190-17f0baa2a6c3", "Kuchyňa s ostrovom"),
            ("1600210492486-724fe5c67fb0", "Jedálenská zóna"),
            ("1617806118233-18e1de247200", "Master suite"),
            ("1552321554-5fefe8c9ef14", "Kúpeľňa"),
        ],
        "days_ago": 2,
    },
    {
        "slug": "moderna-vila-s-bazenom-koliba",
        "title": "Moderná vila s bazénom na Kolibe",
        "transaction": "predaj", "property_type": "dom",
        "price": "2450000", "city": "Bratislava", "district": "Koliba, Na Revíne",
        "floor_area": "420", "land_area": "1250", "rooms": 6, "floor": None,
        "condition": "novostavba", "energy_class": "A",
        "badge": "exkluzivne", "is_featured": True, "agent": 0,
        "amenities": ["Bazén", "Terasa", "Záhrada", "Garáž", "Tepelné čerpadlo", "Klimatizácia", "Smart home", "Sauna"],
        "description": (
            "Architektonicky čistá vila v jednej z najžiadanejších rezidenčných lokalít Bratislavy. "
            "Dom je osadený vo svahu tak, aby všetky obytné miestnosti mali výhľad na mesto a do upravenej záhrady "
            "s vyhrievaným 12-metrovým bazénom.\n\n"
            "Dispozícia ponúka priestranný denný priestor s veľkoformátovými posuvnými stenami, šesť izieb, "
            "wellness so saunou, posilňovňu a garáž pre tri autá. Dom je vybavený tepelným čerpadlom, "
            "rekuperáciou a fotovoltikou – energetická trieda A0.\n\n"
            "Lesopark a Kamzík sú na dosah, centrum mesta len 10 minút autom."
        ),
        "cover": "1613490493576-7fde63acd811",
        "gallery": [
            ("1613490493576-7fde63acd811", "Vila s bazénom"),
            ("1600596542815-ffad4c1539a9", "Pohľad zo záhrady"),
            ("1600585154340-be6161a56a0c", "Vstupná fasáda"),
            ("1600210492486-724fe5c67fb0", "Denná zóna"),
            ("1616594039964-ae9021a400a0", "Obývacia izba"),
        ],
        "days_ago": 5,
    },
    {
        "slug": "elegantny-3-izbovy-byt-pri-dunaji",
        "title": "Elegantný 3-izbový byt pri Dunaji",
        "transaction": "predaj", "property_type": "byt",
        "price": "549000", "city": "Bratislava", "district": "Staré Mesto, Rázusovo nábrežie",
        "floor_area": "98", "land_area": None, "rooms": 3, "floor": 4,
        "condition": "kompletna_rekonstrukcia", "energy_class": "B",
        "badge": "novinka", "is_featured": True, "agent": 1,
        "amenities": ["Balkón", "Výťah", "Pivnica", "Klimatizácia", "Vstavané skrine"],
        "description": (
            "Svetlý trojizbový byt s balkónom orientovaným na Dunaj, po kompletnej rekonštrukcii s použitím "
            "kvalitných materiálov. Byt sa nachádza v elegantnom prvorepublikovom dome s výťahom.\n\n"
            "Dispozícia: vstupná hala, obývacia izba prepojená s kuchyňou, dve spálne, kúpeľňa so sprchovým kútom, "
            "samostatné WC a šatník. K bytu patrí priestranná pivnica.\n\n"
            "Lokalita ponúka promenádu pri rieke, Slovenské národné divadlo a hlavné kultúrne inštitúcie v pešej vzdialenosti."
        ),
        "cover": "1502672260266-1c1ef2d93688",
        "gallery": [
            ("1502672260266-1c1ef2d93688", "Obývacia izba"),
            ("1484154218962-a197022b5858", "Kuchyňa"),
            ("1505691938895-1758d7feb511", "Spálňa"),
            ("1493809842364-78817add7ffb", "Denná zóna"),
        ],
        "days_ago": 1,
    },
    {
        "slug": "rodinny-dom-v-tichej-casti-koliby",
        "title": "Rodinný dom v tichej časti Koliby",
        "transaction": "predaj", "property_type": "dom",
        "price": "985000", "city": "Bratislava", "district": "Koliba, Bárdošova",
        "floor_area": "245", "land_area": "720", "rooms": 5, "floor": None,
        "condition": "kompletna_rekonstrukcia", "energy_class": "B",
        "badge": "znizena_cena", "is_featured": False, "agent": 1,
        "amenities": ["Záhrada", "Terasa", "Garáž", "Krb", "Pivnica", "Tepelné čerpadlo"],
        "description": (
            "Rodinný dom po citlivej rekonštrukcii na pokojnej ulici s výhľadom na vinice. "
            "Na prízemí sa nachádza otvorená obývacia časť s krbom, kuchyňa so spižou a pracovňa, "
            "na poschodí tri spálne a dve kúpeľne.\n\n"
            "Udržiavaná záhrada so vzrastlými stromami, krytá terasa a dvojgaráž. "
            "Materská aj základná škola sú v docházkovej vzdialenosti."
        ),
        "cover": "1564013799919-ab600027ffc6",
        "gallery": [
            ("1564013799919-ab600027ffc6", "Exteriér domu"),
            ("1507089947368-19c1da9775ae", "Obývacia izba"),
            ("1556909114-f6e7ad7d3136", "Kuchyňa"),
            ("1595526114035-0d45ed16cfbf", "Spálňa"),
        ],
        "days_ago": 18,
    },
    {
        "slug": "designovy-2-izbovy-byt-na-prenajom-stare-mesto",
        "title": "Dizajnový 2-izbový byt na prenájom",
        "transaction": "prenajom", "property_type": "byt",
        "price": "1350", "city": "Bratislava", "district": "Staré Mesto, Obchodná ulica",
        "floor_area": "62", "land_area": None, "rooms": 2, "floor": 3,
        "condition": "novostavba", "energy_class": "A",
        "badge": "novinka", "is_featured": False, "agent": 1,
        "amenities": ["Balkón", "Výťah", "Klimatizácia", "Kompletne zariadený", "Parkovanie"],
        "description": (
            "Kompletne zariadený dvojizbový byt v novostavbe v centre mesta. Byt je pripravený na okamžité nasťahovanie – "
            "spotrebiče Miele, kvalitný nábytok, klimatizácia a podlahové kúrenie.\n\n"
            "Cena nájmu je uvedená mesačne bez energií. Možnosť prenájmu parkovacieho miesta v podzemnej garáži."
        ),
        "cover": "1522708323590-d24dbb6b0267",
        "gallery": [
            ("1522708323590-d24dbb6b0267", "Obývacia izba"),
            ("1560448204-e02f11c3d0e2", "Kuchyňa"),
            ("1586023492125-27b2c045efd7", "Detail interiéru"),
        ],
        "days_ago": 3,
    },
    {
        "slug": "mestsky-byt-v-historickom-centre-kosic",
        "title": "Mestský byt v historickom centre Košíc",
        "transaction": "predaj", "property_type": "byt",
        "price": "329000", "city": "Košice", "district": "Staré Mesto, Hlavná ulica",
        "floor_area": "112", "land_area": None, "rooms": 3, "floor": 2,
        "condition": "kompletna_rekonstrukcia", "energy_class": "C",
        "badge": "exkluzivne", "is_featured": True, "agent": 2,
        "amenities": ["Vysoké stropy", "Pivnica", "Klimatizácia", "Vstavané skrine"],
        "description": (
            "Reprezentatívny byt v pamiatkovo chránenom dome priamo na Hlavnej ulici, len pár krokov od Dómu sv. Alžbety. "
            "Pôvodné kazetové dvere, štukové stropy a dubové parkety sa tu stretávajú s modernou kuchyňou a kúpeľňou.\n\n"
            "Byt je vhodný na bývanie aj ako prémiová investícia na krátkodobý prenájom."
        ),
        "cover": "1560185007-cde436f6a4d0",
        "gallery": [
            ("1560185007-cde436f6a4d0", "Obývacia izba"),
            ("1556912173-3bb406ef7e77", "Kuchyňa"),
            ("1631049307264-da0ec9d70304", "Spálňa"),
        ],
        "days_ago": 8,
    },
    {
        "slug": "rodinny-dom-kosice-myslava",
        "title": "Nízkoenergetický rodinný dom, Košice – Myslava",
        "transaction": "predaj", "property_type": "dom",
        "price": "465000", "city": "Košice", "district": "Myslava",
        "floor_area": "168", "land_area": "640", "rooms": 5, "floor": None,
        "condition": "novostavba", "energy_class": "A",
        "badge": "rezervovane", "is_featured": False, "agent": 2,
        "amenities": ["Záhrada", "Terasa", "Garáž", "Tepelné čerpadlo", "Rekuperácia"],
        "description": (
            "Novostavba nízkoenergetického domu v obľúbenej mestskej časti s rýchlym napojením na centrum. "
            "Dom ponúka štyri spálne, otvorený denný priestor so vstupom na terasu a garáž.\n\n"
            "Nehnuteľnosť je momentálne rezervovaná – radi vám ponúkneme podobné domy z našej ponuky."
        ),
        "cover": "1570129477492-45c003edd2be",
        "gallery": [
            ("1570129477492-45c003edd2be", "Exteriér"),
            ("1600047509807-ba8f99d2cdde", "Záhrada"),
            ("1512918728675-ed5a9ecdebfd", "Interiér"),
        ],
        "days_ago": 25,
    },
    {
        "slug": "kancelarske-priestory-kosice-centrum",
        "title": "Reprezentatívne kancelárske priestory",
        "transaction": "prenajom", "property_type": "komercne",
        "price": "3800", "city": "Košice", "district": "Južná trieda",
        "floor_area": "280", "land_area": None, "rooms": 8, "floor": 5,
        "condition": "novostavba", "energy_class": "B",
        "badge": "none", "is_featured": False, "agent": 2,
        "amenities": ["Výťah", "Klimatizácia", "Parkovanie", "Recepcia", "Zasadacia miestnosť"],
        "description": (
            "Moderné kancelárie v administratívnej budove triedy A s recepciou a 24/7 prístupom. "
            "Open space pre 25 pracovných miest, dve zasadačky, kuchynka a 6 parkovacích miest.\n\n"
            "Cena nájmu je uvedená mesačne bez DPH a služieb."
        ),
        "cover": "1497366216548-37526070297c",
        "gallery": [
            ("1497366216548-37526070297c", "Open space"),
            ("1497366811353-6870744d04b2", "Zasadacia miestnosť"),
            ("1486406146926-c627a92ad1ab", "Budova"),
        ],
        "days_ago": 30,
    },
    {
        "slug": "slnecny-byt-so-zahradou-zilina",
        "title": "Slnečný byt s predzáhradkou, Žilina – Bôrik",
        "transaction": "predaj", "property_type": "byt",
        "price": "238000", "city": "Žilina", "district": "Bôrik",
        "floor_area": "84", "land_area": None, "rooms": 3, "floor": 0,
        "condition": "novostavba", "energy_class": "A",
        "badge": "novinka", "is_featured": True, "agent": 3,
        "amenities": ["Predzáhradka", "Terasa", "Parkovanie", "Pivnica", "Podlahové kúrenie"],
        "description": (
            "Trojizbový byt na prízemí novostavby s vlastnou predzáhradkou s výmerou 70 m². "
            "Tichá rezidenčná lokalita pri lesoparku Chrasť, s výbornou dostupnosťou do centra.\n\n"
            "K bytu patrí parkovacie státie a pivničná kobka."
        ),
        "cover": "1600566753086-00f18fb6b3ea",
        "gallery": [
            ("1600566753086-00f18fb6b3ea", "Exteriér"),
            ("1600585154526-990dced4db0d", "Obývacia izba"),
            ("1556912173-3bb406ef7e77", "Kuchyňa"),
        ],
        "days_ago": 4,
    },
    {
        "slug": "stavebny-pozemok-zilina-zadubnie",
        "title": "Stavebný pozemok s výhľadom na Malú Fatru",
        "transaction": "predaj", "property_type": "pozemok",
        "price": "149000", "city": "Žilina", "district": "Zádubnie",
        "floor_area": "0", "land_area": "1100", "rooms": 0, "floor": None,
        "condition": "neuvedene", "energy_class": "G",
        "badge": "znizena_cena", "is_featured": False, "agent": 3,
        "amenities": ["Inžinierske siete", "Prístupová cesta", "Južná orientácia"],
        "description": (
            "Rovinatý stavebný pozemok s južnou orientáciou a výhľadom na hrebene Malej Fatry. "
            "Elektrina, voda a plyn na hranici pozemku, asfaltová prístupová cesta.\n\n"
            "Podľa územného plánu určený na výstavbu rodinného domu."
        ),
        "cover": "1500382017468-9049fed747ef",
        "gallery": [
            ("1500382017468-9049fed747ef", "Pozemok"),
            ("1464146072230-91cabc968266", "Okolie"),
        ],
        "days_ago": 40,
    },
    {
        "slug": "horska-rezidencia-tatranska-lomnica",
        "title": "Horská rezidencia v Tatranskej Lomnici",
        "transaction": "predaj", "property_type": "dom",
        "price": "1150000", "city": "Vysoké Tatry", "district": "Tatranská Lomnica",
        "floor_area": "310", "land_area": "980", "rooms": 6, "floor": None,
        "condition": "novostavba", "energy_class": "A",
        "badge": "exkluzivne", "is_featured": True, "agent": 3,
        "amenities": ["Sauna", "Krb", "Terasa", "Garáž", "Lyžiareň", "Wellness", "Záhrada"],
        "description": (
            "Horská rezidencia z dreva a kameňa s priamym výhľadom na Lomnický štít. "
            "Dom spája alpskú tradíciu s modernou architektúrou – obývacia hala s krbom a presklenou štítovou stenou, "
            "päť spální s vlastnými kúpeľňami, wellness so saunou a lyžiareň.\n\n"
            "Výborná príležitosť aj pre luxusný rekreačný prenájom – lanovka je vzdialená 5 minút."
        ),
        "cover": "1510798831971-661eb04b3739",
        "gallery": [
            ("1510798831971-661eb04b3739", "Rezidencia v zime"),
            ("1542718610-a1d656d1884c", "Exteriér pri západe slnka"),
            ("1616594039964-ae9021a400a0", "Spálňa"),
        ],
        "days_ago": 6,
    },
    {
        "slug": "apartman-strbske-pleso",
        "title": "Apartmán s výhľadom na Štrbské pleso",
        "transaction": "predaj", "property_type": "byt",
        "price": "395000", "city": "Vysoké Tatry", "district": "Štrbské Pleso",
        "floor_area": "74", "land_area": None, "rooms": 2, "floor": 2,
        "condition": "novostavba", "energy_class": "B",
        "badge": "predane", "is_featured": False, "agent": 3,
        "amenities": ["Balkón", "Výťah", "Lyžiareň", "Parkovanie", "Kompletne zariadený"],
        "description": (
            "Plne zariadený dvojizbový apartmán v rezidenčnom komplexe so službami hotela. "
            "Balkón s výhľadom na pleso a štíty Vysokých Tatier.\n\n"
            "Nehnuteľnosť bola úspešne predaná. Hľadáte podobnú? Kontaktujte nás."
        ),
        "cover": "1449844908441-8829872d2607",
        "gallery": [
            ("1449844908441-8829872d2607", "Apartmán"),
            ("1519643381401-22c77e60520e", "Výhľad na Tatry"),
        ],
        "days_ago": 60,
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovými maklérmi a nehnuteľnosťami (idempotentne)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-admin", action="store_true",
            help="Nevytvárať ukážkového administrátora.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        agents = []
        for data in AGENTS:
            data = dict(data)
            email = data.pop("email")
            agent, _ = Agent.objects.update_or_create(email=email, defaults=data)
            agents.append(agent)
        self.stdout.write(f"Makléri: {len(agents)}")

        now = timezone.now()
        for data in PROPERTIES:
            data = dict(data)
            slug = data.pop("slug")
            gallery = data.pop("gallery")
            cover = data.pop("cover")
            days_ago = data.pop("days_ago")
            data["agent"] = agents[data["agent"]]
            data["cover_image_url"] = U.format(cover)
            data["price"] = Decimal(data["price"])
            data["floor_area"] = Decimal(data["floor_area"])
            if data["land_area"] is not None:
                data["land_area"] = Decimal(data["land_area"])

            prop, _ = Property.objects.update_or_create(slug=slug, defaults=data)
            # created_at is auto_now_add, so backdate via update() for realistic ordering
            Property.objects.filter(pk=prop.pk).update(created_at=now - timedelta(days=days_ago))

            prop.images.all().delete()
            PropertyImage.objects.bulk_create(
                PropertyImage(property=prop, image_url=U.format(photo), caption=caption, display_order=i)
                for i, (photo, caption) in enumerate(gallery)
            )
        self.stdout.write(f"Nehnuteľnosti: {len(PROPERTIES)}")

        if not options["no_admin"] and settings.DEBUG:
            User = get_user_model()
            if not User.objects.filter(username=DEMO_ADMIN_USERNAME).exists():
                User.objects.create_superuser(DEMO_ADMIN_USERNAME, "", DEMO_ADMIN_PASSWORD)
                self.stdout.write(
                    f"Vytvorený administrátor: {DEMO_ADMIN_USERNAME} / {DEMO_ADMIN_PASSWORD}"
                )

        self.stdout.write(self.style.SUCCESS("Ukážkové dáta boli úspešne načítané."))
