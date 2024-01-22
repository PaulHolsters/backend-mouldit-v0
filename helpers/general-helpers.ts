export default {
    capitalizeFirst: function (text: string): string {
        return text.charAt(0).toUpperCase() + text.substring(1)
    },
    toUpperCase: function (text: string): string {
        return text.toUpperCase()
    },
    toLowerCase: function (text: string): string {
        return text.toLowerCase()
    },
    createSpaces: function (text: string): string {
        return text.replace(/_/g, ' ')
    },

}