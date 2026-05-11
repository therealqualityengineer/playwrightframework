export class RandomUtil
{
    static generateRandomString(length: number): string
    {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        let result = '';

        for (let i = 0; i < length; i++)
        {
            result += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }

        return result;
    }

    static generateRandomNumber(length: number): string
    {
        const numbers = '0123456789';

        let result = '';

        for (let i = 0; i < length; i++)
        {
            result += numbers.charAt(
                Math.floor(Math.random() * numbers.length)
            );
        }

        return result;
    }

    static generateRandomAlphaNumeric(length: number): string
    {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let result = '';

        for (let i = 0; i < length; i++)
        {
            result += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }

        return result;
    }

    static getDate(count : number): string
    {
        const date = new Date();
        date.setDate(date.getDate() + count);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
}