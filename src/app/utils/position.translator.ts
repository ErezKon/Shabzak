import { KeyValue } from "@angular/common";
import { Position } from "../models/position.enum";

export const translatePosition = (position: Position): string => {
    switch (position) {
        case Position.Simple:
            return 'חפ"ש';
        case Position.Marksman:
            return 'קלע';
        case Position.GrenadeLauncher:
            return 'מטול';
        case Position.Medic:
            return 'חובש';
        case Position.Negev:
            return 'נגב';
        case Position.Hamal:
            return 'חמ"ל';
        case Position.Sniper:
            return 'צלף';
        case Position.Translator:
            return 'מתורגמן';
        case Position.ShootingInstructor:
            return 'מדריך ירי';
        case Position.KravMagaInstructor:
            return 'מדריך קרב מגע';
        case Position.DroneOperator:
            return 'רחפן';
        case Position.PlatoonCommanderComms:
            return 'קשר מ"מ';
        case Position.CompanyCommanderComms:
            return 'קשר מ"פ';
        case Position.ClassCommander:
            return 'מ"כ';
        case Position.Sergant:
            return 'סמל';
        case Position.PlatoonCommander:
            return 'מ"מ';
        case Position.CompanyDeputy:
            return 'סמ"פ';
        case Position.CompanyCommander:
            return 'מ"פ';
    }
};

export const getPositionsKeyValue = (): Array<KeyValue<string, string>>=> {
    const ret = new Array<KeyValue<string, string>>();
    const stringKeys = Object
        .values(Position)
        .filter((v) => isNaN(Number(v)))
        .map(val => {
            ret.push({
                key: val.toString(),
                value: translatePosition(Position[val as keyof typeof Position])
            } as KeyValue<string, string>)
        })
    return ret;
};