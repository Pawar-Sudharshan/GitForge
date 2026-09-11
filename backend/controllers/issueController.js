const getAllIssues = (req, res) => {
    res.json({ message: "All issues fetched!" });
};

const createIssue = (req, res) => {
    res.json({ message: "Issue created!" });
};

const getIssueById = (req, res) => {
    res.json({ message: `Issue ${req.params.id} fetched!` });
};

const updateIssue = (req, res) => {
    res.json({ message: `Issue ${req.params.id} updated!` });
};

const deleteIssue = (req, res) => {
    res.json({ message: `Issue ${req.params.id} deleted!` });
};

export default {
    getAllIssues,
    createIssue,
    getIssueById,
    updateIssue,
    deleteIssue
};
