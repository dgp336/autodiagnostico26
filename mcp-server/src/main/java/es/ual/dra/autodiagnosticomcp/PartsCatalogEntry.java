package es.ual.dra.autodiagnosticomcp;

/**
 * Entrada de un catálogo de piezas por motorización.
 * Misma forma que `general-car-parts*.json`: {name, description, priceRange}.
 * El campo `name` DEBE coincidir con `Product.name` en la BD del backend para
 * que la resolución final por nombre funcione.
 */
public record PartsCatalogEntry(
        String name,
        String description,
        String priceRange
) {}
