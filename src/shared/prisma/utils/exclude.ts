// Source: https://www.prisma.io/docs/concepts/components/prisma-client/excluding-fields

export function exclude<Entity, Key extends keyof Entity>(entity: Entity, keys: Key[]): Omit<Entity, Key> {
    return Object.fromEntries(Object.entries(entity).filter(([key]) => !keys.includes(key as Key))) as Omit<
        Entity,
        Key
    >;
}
