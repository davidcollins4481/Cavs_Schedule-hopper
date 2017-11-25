const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Services = Me.imports.Services;

let button, teamService;

const CavsPanelButton = new Lang.Class({
    Name: "CavsPanelButton",
    Extends: PanelMenu.Button,

    _init: function() {
        var self = this;
        this.parent(0.0, "Cavs Panel Button", false);
        this.teamService = new Services.TeamService();
        this.gameService = new Services.GameService();
        let path = Me.path + "/img/cleveland-cavs.png";
        let file = Gio.File.new_for_path(path);

        let icon = new St.Icon({
            style_class: 'cavs-icon',
            gicon: Gio.FileIcon.new(file)
        });

        this.actor.add_actor(icon);

        let teams = this.teamService.getTeams();
        let that = this;
        this.gameService.getAll(function(games) {
            games.forEach(function(game) {

                let visitingTeam = that.teamService.getTeamById(game.vTeam.teamId);
                let homeTeam     = that.teamService.getTeamById(game.hTeam.teamId);
                let startTime    = new Date(game.startTimeUTC);
                let label = "";
                if (game.isHomeTeam) {
                    label = homeTeam['fullName'] + " vs. " + visitingTeam['fullName'];
                } else {
                    label = visitingTeam['fullName'] + " vs. " + homeTeam['fullName'];
                }

                let [m, d, y] = [startTime.getMonth() + 1, startTime.getDate(), startTime.getFullYear()];
                label += " " + `(${m}/${d}/${y})`;
                let menuItem = new PopupMenu.PopupMenuItem(label);
                that.menu.addMenuItem(menuItem);
            });
        });
    }
});

function _showSchedule() {
    global.log('showing schedule');
    let menuItem = new PopupMenu.PopupBaseMenuItem();

    button.menu.addMenuItem(menuItem);
}

function init() {
    button = new CavsPanelButton();
}

function enable() {
    Main.panel.addToStatusArea('cavs-button', button);
}

function disable() {
    button.destroy();
}
