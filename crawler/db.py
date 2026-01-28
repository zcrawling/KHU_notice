import json
import os
from itertools import cycle


class BoardManager:
    def __init__(self, file_path='boards_db.json'):
        self.file_path = file_path
        self.boards_data = {}
        self.flat_list = []
        self.queue = None
        self.load_data()
        self._build_queue()

    def load_data(self):
        if os.path.exists(self.file_path):
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.boards_data = json.load(f)
        else:
            print("LOAD ERROR: exit Program\n")
            exit()

    def _build_queue(self):
        self.flat_list = []
        for category, boards in self.boards_data.items():
            for board in boards:
                board['category'] = category
                self.flat_list.append(board)
        self.queue = cycle(self.flat_list)

    def get_next(self):
        return next(self.queue)

    def save_data(self):
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(self.boards_data, f, ensure_ascii=False, indent=4)