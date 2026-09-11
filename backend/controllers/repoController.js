const getAllRepos = (req, res) => {
    res.json({ message: "All repositories fetched!" });
};

const createRepo = (req, res) => {
    res.json({ message: "Repository created!" });
};

const getRepoById = (req, res) => {
    res.json({ message: `Repository ${req.params.id} fetched!` });
};

const updateRepo = (req, res) => {
    res.json({ message: `Repository ${req.params.id} updated!` });
};

const deleteRepo = (req, res) => {
    res.json({ message: `Repository ${req.params.id} deleted!` });
};

export default {
    getAllRepos,
    createRepo,
    getRepoById,
    updateRepo,
    deleteRepo
};
