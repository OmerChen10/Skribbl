import flask
import threading
import os
import Constants
import logging
from colorama import Fore, Style


class WebsiteServer(threading.Thread):
    """ The website server. """

    __instance = None

    def __init__(self) -> None:
        threading.Thread.__init__(self)

        if (WebsiteServer.__instance is not None):
            raise Exception("Only one instance of WebsiteServer is allowed")
        
        WebsiteServer.__instance = self


        ROOT = os.path.dirname((__file__))
        # Set up the template & static folder's path
        self.app = flask.Flask(__name__, 
                               template_folder=os.path.join(ROOT, "pages"),
                               static_folder=os.path.join(ROOT, "static"))

        logging.getLogger('werkzeug').disabled = True # Disable flask's logging

        @self.app.route('/') # The index page
        def index():
            return flask.render_template('index.html')

        @self.app.errorhandler(404) # The 404 page
        def page_not_found(e):
            return flask.render_template('game_not_found.html'), 404

        self.start() # Start the thread
    

    @staticmethod
    def get_instance(): 
        """ Returns the instance of the WebsiteServer. """
        
        if (WebsiteServer.__instance is None): 
            WebsiteServer() # Create a new instance if it doesn't exist
            
        return WebsiteServer.__instance
    

    def get_html(self):
        return flask.render_template('game.html')


    def add_game_code(self, game_code: str) -> None:
        """ Adds a game code to the website. """
        
        endpoint = f'game_{game_code}' # The endpoint for the game
        self.app.add_url_rule(f'/{game_code}', endpoint, self.get_html)
        

    def run(self):
        """ Starts the website server. """
        
        print("[Website] Starting website server")

        self.app.run(host='0.0.0.0',
                     port=Constants.NetworkConfig.WEBSITE_PORT, 
                     debug=False)


if __name__ == '__main__':
    website = WebsiteServer()
    website.start()
