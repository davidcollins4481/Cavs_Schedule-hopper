const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Services = Me.imports.Services;

let button;

const CavsPanelButton = new Lang.Class({
    Name: "CavsPanelButton",
    Extends: PanelMenu.Button,

    _init: function() {
        var self = this;
        this.parent(0.0, "Cavs Panel Button", false);
        this.teamService = new Services.TeamService();
        this.gameService = new Services.GameService();
        let file = Gio.File.new_for_path(Me.path + "/img/cleveland-cavs.png");

        let icon = new St.Icon({
            style_class: 'cavs-icon',
            gicon: Gio.FileIcon.new(file)
        });

        this.actor.add_actor(icon);

        this.menu.actor.add_style_class_name('top-level');

        this.gameService.getAll(function(games) {
            games.slice(0, 20).forEach(function(game, i) {
                let visitingTeam = self.teamService.getTeamById(game.vTeam.teamId);
                let homeTeam     = self.teamService.getTeamById(game.hTeam.teamId);
                let startTime    = new Date(game.startTimeUTC);
                let label = visitingTeam['fullName'] + " at " + homeTeam['fullName'];
                let [m, d, y] = [startTime.getMonth() + 1, startTime.getDate(), startTime.getFullYear()];
                label += " " + `(${m}/${d}/${y})`;

                let broadcasters = game.watch.broadcast.broadcasters[game.isHomeTeam ? 'hTeam' : 'vTeam'];

                let broadcasterNames = broadcasters.map(function(b) {
                    return b.longName;
                });

                if (broadcasterNames.length > 0) {
                    label += "\nNetwork: " + broadcasterNames.join(', ');
                } else {
                    label += "\nNetwork: -";
                }

                let menuItem = new PopupMenu.PopupMenuItem(label);
                menuItem.actor.add_style_class_name(game.isHomeTeam ? 'home-game' : 'away-game');
                self.menu.addMenuItem(menuItem);
            });
        });
    }
});

function init() {
}

function enable() {
    button = new CavsPanelButton();
    Main.panel.addToStatusArea('cavs-button', button);
}

function disable() {
    button.destroy();
}
