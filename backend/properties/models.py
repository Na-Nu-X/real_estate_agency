from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Agent(models.Model):
    full_name = models.CharField("Meno a priezvisko", max_length=120)
    role = models.CharField("Pozícia", max_length=120)
    phone = models.CharField("Telefón", max_length=40)
    email = models.EmailField("E-mail")
    photo_url = models.URLField("URL fotografie", max_length=500, blank=True)
    bio = models.TextField("Krátky profil", blank=True)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "Maklér"
        verbose_name_plural = "Makléri"
        ordering = ["display_order", "full_name"]

    def __str__(self) -> str:
        return self.full_name


class Property(models.Model):
    class Transaction(models.TextChoices):
        SALE = "predaj", "Predaj"
        RENT = "prenajom", "Prenájom"

    class PropertyType(models.TextChoices):
        APARTMENT = "byt", "Byt"
        HOUSE = "dom", "Dom"
        LAND = "pozemok", "Pozemok"
        COMMERCIAL = "komercne", "Komerčné"

    class Condition(models.TextChoices):
        NEW_BUILD = "novostavba", "Novostavba"
        FULL_RENOVATION = "kompletna_rekonstrukcia", "Kompletná rekonštrukcia"
        PARTIAL_RENOVATION = "ciastocna_rekonstrukcia", "Čiastočná rekonštrukcia"
        ORIGINAL = "povodny_stav", "Pôvodný stav"
        DEVELOPMENT = "vo_vystavbe", "Vo výstavbe"
        NOT_APPLICABLE = "neuvedene", "Neuvedené"

    class EnergyClass(models.TextChoices):
        A = "A", "A"
        B = "B", "B"
        C = "C", "C"
        D = "D", "D"
        E = "E", "E"
        F = "F", "F"
        G = "G", "G"

    class Badge(models.TextChoices):
        EXCLUSIVE = "exkluzivne", "Exkluzívne"
        NEW = "novinka", "Novinka"
        PRICE_REDUCED = "znizena_cena", "Znížená cena"
        RESERVED = "rezervovane", "Rezervované"
        SOLD = "predane", "Predané"
        NONE = "none", "Bez štítku"

    title = models.CharField("Názov", max_length=200)
    slug = models.SlugField("URL adresa (slug)", max_length=220, unique=True, blank=True)
    transaction = models.CharField(
        "Typ transakcie", max_length=20, choices=Transaction.choices, default=Transaction.SALE
    )
    property_type = models.CharField(
        "Typ nehnuteľnosti", max_length=20, choices=PropertyType.choices, default=PropertyType.APARTMENT
    )
    price = models.DecimalField(
        "Cena (EUR)", max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    city = models.CharField("Mesto / lokalita", max_length=120, db_index=True)
    district = models.CharField("Mestská časť / ulica", max_length=160, blank=True)
    floor_area = models.DecimalField(
        "Úžitková plocha (m²)", max_digits=9, decimal_places=2, validators=[MinValueValidator(0)]
    )
    land_area = models.DecimalField(
        "Plocha pozemku (m²)", max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)],
    )
    rooms = models.PositiveSmallIntegerField("Počet izieb", default=0)
    floor = models.SmallIntegerField("Podlažie", null=True, blank=True)
    condition = models.CharField(
        "Stav", max_length=40, choices=Condition.choices, default=Condition.NEW_BUILD
    )
    energy_class = models.CharField(
        "Energetický certifikát", max_length=1, choices=EnergyClass.choices, default=EnergyClass.B
    )
    description = models.TextField("Podrobný popis")
    amenities = models.JSONField(
        "Vybavenie", default=list, blank=True,
        help_text='Zoznam vo formáte JSON, napr. ["Balkón", "Garáž", "Výťah"]',
    )
    badge = models.CharField("Štítok", max_length=20, choices=Badge.choices, default=Badge.NONE)
    cover_image_url = models.URLField("URL titulnej fotografie", max_length=500)
    is_featured = models.BooleanField("Odporúčaná ponuka", default=False)
    agent = models.ForeignKey(
        Agent, verbose_name="Maklér", related_name="properties",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)

    class Meta:
        verbose_name = "Nehnuteľnosť"
        verbose_name_plural = "Nehnuteľnosti"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    def _build_unique_slug(self) -> str:
        base = slugify(self.title)[:200] or "nehnutelnost"
        slug, counter = base, 2
        while Property.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base}-{counter}"
            counter += 1
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._build_unique_slug()
        super().save(*args, **kwargs)


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property, verbose_name="Nehnuteľnosť", related_name="images", on_delete=models.CASCADE
    )
    image_url = models.URLField("URL fotografie", max_length=500)
    caption = models.CharField("Popis", max_length=200, blank=True)
    display_order = models.PositiveIntegerField("Poradie", default=0)

    class Meta:
        verbose_name = "Fotografia"
        verbose_name_plural = "Fotogaléria"
        ordering = ["display_order", "id"]

    def __str__(self) -> str:
        return self.caption or f"Fotografia #{self.pk}"


class ViewingInquiry(models.Model):
    property = models.ForeignKey(
        Property, verbose_name="Nehnuteľnosť", related_name="inquiries", on_delete=models.CASCADE
    )
    client_name = models.CharField("Meno klienta", max_length=120)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=40)
    preferred_datetime = models.DateTimeField("Preferovaný termín", null=True, blank=True)
    message = models.TextField("Správa", blank=True)
    is_resolved = models.BooleanField("Vybavené", default=False)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "Žiadosť o obhliadku"
        verbose_name_plural = "Žiadosti o obhliadku"
        ordering = ["is_resolved", "-created_at"]

    def __str__(self) -> str:
        return f"{self.client_name} – {self.property}"


class ValuationRequest(models.Model):
    property_type = models.CharField(
        "Typ nehnuteľnosti", max_length=20, choices=Property.PropertyType.choices
    )
    location = models.CharField("Lokalita", max_length=200)
    floor_area = models.DecimalField(
        "Plocha (m²)", max_digits=9, decimal_places=2,
        validators=[MinValueValidator(1), MaxValueValidator(100000)],
    )
    rooms = models.PositiveSmallIntegerField("Počet izieb", default=0)
    condition = models.CharField("Stav", max_length=40, choices=Property.Condition.choices)
    owner_name = models.CharField("Meno majiteľa", max_length=120)
    phone = models.CharField("Telefón", max_length=40)
    email = models.EmailField("E-mail")
    notes = models.TextField("Poznámka", blank=True)
    is_resolved = models.BooleanField("Vybavené", default=False)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "Žiadosť o ocenenie"
        verbose_name_plural = "Žiadosti o ocenenie"
        ordering = ["is_resolved", "-created_at"]

    def __str__(self) -> str:
        return f"{self.owner_name} – {self.location}"


class ContactMessage(models.Model):
    name = models.CharField("Meno", max_length=120)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=40, blank=True)
    subject = models.CharField("Predmet", max_length=200, blank=True)
    message = models.TextField("Správa")
    is_resolved = models.BooleanField("Vybavené", default=False)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "Správa z kontaktného formulára"
        verbose_name_plural = "Správy z kontaktného formulára"
        ordering = ["is_resolved", "-created_at"]

    def __str__(self) -> str:
        return f"{self.name} – {self.subject or 'bez predmetu'}"
