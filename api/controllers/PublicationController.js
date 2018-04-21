/**
 * PublicationController
 *
 * @description :: Server-side logic for managing Publications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var nestedPop = require('nested-pop');

module.exports = {
    /**
     * Поиск публикаций по id, названиям публикаций, псевдонимам авторов, названиям издания и информации об публикации
     */
    find: async function (req, res) {
        let data = req.allParams();
        let paramsFind = this.getParamsFind(data);
        /* console.log(paramsFind);
        console.log();
        console.log(); */

        // находятся подходящие названия публикаций
        /* console.log('titles');
        console.log(paramsFind.titles); */
        let titles = await PublicationTitle.find(paramsFind.titles);
        /* console.log(titles);
        console.log();
        console.log(); */

        // находятся подходящие авторы
        /* console.log('authors');
        console.log(paramsFind.authors); */
        let authors = await Author.find()
            .populate('names', paramsFind.authors)
            .populate('publications');
        /* console.log(authors);
        console.log();
        console.log(); */

        // находятся подходящие издания
        /* console.log('editor');
        console.log(paramsFind.editor); */
        let editors = await Editor.find()
            .populate('titles', paramsFind.editor)
            .populate('publications');
        /* console.log(editors);
        console.log();
        console.log(); */

        // формируется массив уникальных id публикаций
        let arrayIdPublications = {
            titles: [],
            authors: [],
            editors: [],
            publications: []
        };
        titles.forEach(title => {
            if (arrayIdPublications.titles.indexOf(title.publication) == -1) {
                arrayIdPublications.titles.push(title.publication);
            }
        });
        authors.forEach(author => {
            if (author.names.length == 0) { return; }
            author.publications.forEach(publication => {
                if (arrayIdPublications.authors.indexOf(publication.id) == -1) {
                    arrayIdPublications.authors.push(publication.id);
                }
            });
        });
        editors.forEach(editor => {
            if (editor.titles.length == 0) { return; }
            editor.publications.forEach(publication => {
                if (arrayIdPublications.editors.indexOf(publication.id) == -1) {
                    arrayIdPublications.editors.push(publication.id);
                }
            });
        });

        let intersect = function (array1, array2)
        {
           var result = array1.filter(function(n) {
              return array2.indexOf(n) !== -1;
           });
        
           return result;
        }

        arrayIdPublications.publications = intersect(arrayIdPublications.titles, intersect(arrayIdPublications.authors, arrayIdPublications.editors));

        /* console.log(arrayIdPublications);
        console.log(); */
        if (paramsFind.publication.id != undefined) {
            if (arrayIdPublications.publications.indexOf(paramsFind.publication.id) == -1) {
                return res.notFound();
            }
        } else {
            paramsFind.publication.id = arrayIdPublications.publications;
        }

        /* console.log('publications');
        console.log(paramsFind.publication) */;
        let publications = await Publication.find(paramsFind.publication)
            .populate('titles')
            .populate('authors')
            .populate('editor');

        publications = publications.map((s) => s.toJSON());
        nestedPop(publications, {
            // массив полей, которые требуется найти
            authors: ['names'],
            editor: ['titles']
        }).then(function (publications) {
            /* console.log(publications);
            console.log();
            console.log(); */
            return res.json(publications);
        }).catch(function (err) {
            return res.serverError(err);
        });
    },
    /**
     * Получение параметров поиска из принятых данных
     */
    getParamsFind: function (data) {
        let paramsFind = {
            publication: {},
            titles: {},
            authors: data.authors.length != 0 ? { or: [] } : {},
            editor: {}
        };

        if (data.id != undefined && data.id != null) {
            paramsFind.publication.id = data.id;
        }

        // поиск по одной строковой фразе в заголовке
        if (data.titles !== undefined && data.titles != '') {
            if ((typeof data.titles) == "string") {
                paramsFind.titles.title = { contains: data.titles };
            }
        }

        // поиск года публикации
        if (data.datepub != undefined && data.datepub != null) {
            paramsFind.publication.datepub = data.datepub;
        }

        // поиск по наличию нахождения в журналах, рейтингах и так далее
        if (data.is_vak != undefined) { paramsFind.publication.is_vak = data.is_vak; }
        if (data.is_rince != undefined) { paramsFind.publication.is_rince = data.is_rince; }
        if (data.is_wos != undefined) { paramsFind.publication.is_wos = data.is_wos; }
        if (data.is_scope != undefined) { paramsFind.publication.is_scope = data.is_scope; }
        if (data.is_doi != undefined) { paramsFind.publication.is_doi = data.is_doi; }

        // поиск по одной строковой фразе в издании
        if (data.editor != undefined && data.editor != '') {
            paramsFind.editor.name = { contains: data.editor };
        }

        data.authors.forEach(author => {
            paramsFind.authors.or.push({
                lastname: { startsWith: author.lastname != undefined ? author.lastname : '' },
                firstname: { startsWith: author.firstname != undefined ? author.firstname : '' },
                patronymic: { startsWith: author.patronymic != undefined ? author.patronymic : '' }
            });
        });

        return paramsFind;
    }
};

